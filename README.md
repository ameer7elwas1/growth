# نظام إدارة النمو - Agents Growth System

نظام لإدارة ومتابعة نمو الوكلاء مع دعم قاعدة البيانات السحابية.

## 🔒 الأمان وإدارة المفاتيح

### ⚠️ مهم جداً: حماية المفاتيح

هذا النظام يستخدم Supabase كقاعدة بيانات. يجب حماية مفاتيح الاتصال:

1. **لا ترفع `config.js` على GitHub** - الملف موجود في `.gitignore`
2. **استخدم `config.example.js` كقالب** - انسخه إلى `config.js` وأضف المفاتيح الحقيقية
3. **للاستخدام على GitHub Pages** - استخدم window variables (انظر أدناه)

### 📋 إعداد المفاتيح

#### للاستخدام المحلي:
1. انسخ `config.example.js` إلى `config.js`
2. أضف المفاتيح الحقيقية من Supabase Dashboard

#### للاستخدام على GitHub Pages:
بما أن `config.js` لن يكون متاحاً على GitHub، يمكنك استخدام window variables:

**الطريقة 1: إضافة script قبل تحميل الصفحة**
```html
<script>
  window.SUPABASE_URL = 'https://your-project.supabase.co';
  window.SUPABASE_ANON_KEY = 'your-anon-key-here';
</script>
<script src="index.html"></script>
```

**الطريقة 2: استخدام GitHub Secrets (للإنتاج)**
- يمكنك استخدام GitHub Actions لضبط متغيرات البيئة
- أو استخدام خدمة خارجية لإدارة المفاتيح

### 🔑 الحصول على المفاتيح من Supabase

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك
3. اذهب إلى Settings → API
4. انسخ:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY`

⚠️ **ملاحظة أمنية**: 
- استخدم فقط **anon key** (المفتاح العام) في الكود
- **لا تستخدم service_role key** أبداً في الكود المصدري
- المفتاح anon آمن للاستخدام العام لأنه مقيد بسياسات Row Level Security (RLS)

## 📁 هيكل المشروع

```
growth/
├── index.html                    # الصفحة الرئيسية
├── agents_growth_iraqcell.html   # صفحة الوكلاء
├── config.js                     # ملف الإعدادات (غير متتبع في Git)
├── config.example.js             # قالب ملف الإعدادات
├── .gitignore                    # ملفات مستثناة من Git
└── README.md                     # هذا الملف
```

## 🚀 التشغيل

### محلياً:
1. افتح `index.html` أو `agents_growth_iraqcell.html` في المتصفح
2. تأكد من وجود `config.js` مع المفاتيح الصحيحة

### على GitHub Pages:
1. ارفع الملفات إلى GitHub
2. فعّل GitHub Pages في إعدادات المستودع
3. أضف window variables للمفاتيح (انظر أعلاه)

## 🔧 الميزات

- ✅ إدارة الوكلاء والبيانات
- ✅ قاعدة بيانات سحابية (Supabase)
- ✅ وضع محلي للعمل بدون اتصال
- ✅ نظام مصادقة المستخدمين
- ✅ تصدير واستيراد البيانات
- ✅ واجهة عربية كاملة

## 📝 الترخيص

هذا المشروع للاستخدام الداخلي.

## 🆘 الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح issue في المستودع.

