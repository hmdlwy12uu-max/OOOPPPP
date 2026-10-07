import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

import { playDhikr, playSound, stopForegroundOnly } from "../audio";
import type { SoundId } from "../adhkar";
import { cachePrayerData, registerBackgroundSync } from "../backgroundSync";
import { usePrayerTimes } from "../prayer";
import { nextDhikrSlots, setupChannels, syncReminders } from "../reminders";
import { useSettings } from "../settings";
import { showToast } from "../toast";

// Keeps scheduled notifications in sync with settings and plays the voice while the app is open.
export function ReminderSync() {
  const { settings, ready } = useSettings();
  const { data } = usePrayerTimes();
  const router = useRouter();

  useEffect(() => {
    if (data) cachePrayerData(data);
  }, [data]);

  useEffect(() => {
    registerBackgroundSync();
  }, []);

  useEffect(() => {
    if (!ready || Platform.OS === "web") return;
    let cancelled = false;
    const run = async () => {
      await setupChannels();
      if (!cancelled) await syncReminders(settings, data);
    };
    run().catch((e) => console.warn("[reminders] sync failed", e));
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") run().catch(() => {});
      if (s === "background") stopForegroundOnly();
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [settings, data, ready]);

  // Foreground notification -> play the Arabic voice + toast.
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = Notifications.addNotificationReceivedListener((n) => {
      const d = n.request.content.data as { soundId?: SoundId; title?: string };
      if (d?.soundId) playDhikr(d.soundId, { title: d.title ?? "تذكير" });
      showToast(d?.title ?? n.request.content.title ?? "تذكير", n.request.content.body ?? undefined);
    });
    // Tapping a notification opens the matching screen (morning/evening adhkar, prayer times).
    const resp = Notifications.addNotificationResponseReceivedListener((r) => {
      const d = r.notification.request.content.data as { kind?: string; cat?: string };
      if (d?.kind === "daily" && d.cat) router.push(`/daily/${d.cat}` as never);
      else if (d?.kind === "adhan") router.push("/");
    });
    return () => {
      sub.remove();
      resp.remove();
    };
  }, [router]);

  // Web preview has no local notifications: fire the reminder in-app at each slot.
  useEffect(() => {
    if (Platform.OS !== "web" || !ready || !settings.master) return;
    let t: ReturnType<typeof setTimeout>;
    const arm = () => {
      const [slot] = nextDhikrSlots(settings, 1);
      if (!slot) return;
      t = setTimeout(() => {
        playSound(slot.dhikr.id);
        showToast(slot.dhikr.text, `تذكير · ${slot.dhikr.title}`);
        arm();
      }, slot.date.getTime() - Date.now());
    };
    arm();
    return () => clearTimeout(t);
  }, [settings, ready]);

  return null;
}
