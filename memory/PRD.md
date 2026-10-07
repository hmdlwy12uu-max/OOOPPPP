# PRD — تطبيق تذكار (Tidhkar)

## المشكلة الأصلية
استنساخ المستودع `https://github.com/dryf090-dot/Aaaddddggg.git` وتشغيله داخل بيئة Expo/FastAPI/MongoDB الحالية مع إصلاح أخطاء التشغيل فقط دون أي تعديل على المزايا أو المنطق ("فقط اصلاح دون تخريب").

## وصف التطبيق
تطبيق إسلامي عربي يشمل: مواقيت الصلاة مع عدّاد تنازلي والتاريخ الهجري، القرآن الكريم (قائمة سور + قارئ + تلاوة صوتية)، الأذكار مع صوت TTS، المسبحة الرقمية، اتجاه القبلة، أقرب المساجد، والإعدادات (طريقة الحساب، التذكيرات).

## شخصيات المستخدمين
- مستخدم عربي مسلم يريد مواقيت الصلاة والأذكار والقرآن في تطبيق واحد.

## البنية التقنية
- Frontend: Expo SDK 57 + expo-router (تبويبات: الرئيسية، القرآن، الأذكار، الإعدادات + شاشات: qibla, mosques, tasbih, surah/[id])
- Backend: FastAPI على المنفذ 8001، كل المسارات تحت /api
- DB: MongoDB (تخزين مؤقت لمواقيت الصلاة والمساجد: prayer_cache, mosque_cache)
- TTS: Emergent LLM Key عبر emergentintegrations (OpenAITextToSpeech) في tts_service.py
- مصادر خارجية: api.aladhan.com (مواقيت)، Overpass/OpenStreetMap (مساجد)

## ما تم تنفيذه
- 2026-10-07: استنساخ المستودع ودمجه كاملاً (frontend + backend + assets + data)
- 2026-10-07: حذف app/index.tsx القديم من القالب (تعارض مسار الجذر مع (tabs)/index.tsx)
- 2026-10-07: إضافة EMERGENT_LLM_KEY إلى backend/.env لخدمة TTS
- 2026-10-07: تثبيت اعتماديات جديدة (@react-native-vector-icons/feather, expo-audio, expo-background-task, expo-location, expo-notifications, expo-task-manager)
- 2026-10-07: إصلاح زر الرجوع في قارئ السورة (canGoBack fallback)
- 2026-10-07: خفض مهلة Overpass إلى 10s لإرجاع خطأ JSON عربي بدل صفحة gateway
- 2026-10-07: اختبار كامل ناجح — Backend 8/8 pytest، كل الشاشات تعمل على المعاينة

## نقاط النهاية (API)
- GET /api/ — حالة الخدمة
- GET /api/adhkar — قائمة الأذكار
- GET /api/audio/{id}.wav — صوت الذكر (TTS مع تخزين مؤقت)
- GET /api/prayer-times?lat&lng&date&method — مواقيت اليوم والغد + هجري
- GET /api/mosques?lat&lng — أقرب المساجد

## المتبقي / Backlog
- P1: مزايا الإشعارات والتشغيل بالخلفية تعمل فقط على البناء الأصلي (ليست Expo Go) — بحاجة بناء عبر زر Publish
- P2: تحسينات مستقبلية حسب طلب المستخدم فقط (لا إضافات دون طلب)
