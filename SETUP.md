# دليل الإعداد - Setup Guide

## ✅ ما تم إنجازه

تم تنظيم المشروع وإزالة المفاتيح الحساسة من الملفات الرئيسية مع الحفاظ على عمل النظام.

### التغييرات:

1. ✅ **تنظيم الملفات**:
   - إنشاء مجلدات منظمة (`config/`, `scripts/`, `sql/`)
   - نقل الملفات إلى المجلدات المناسبة

2. ✅ **إزالة المفاتيح من الملفات الرئيسية**:
   - `index.html` - لا يحتوي على مفاتيح مكشوفة
   - `agents_growth_iraqcell.html` - لا يحتوي على مفاتيح مكشوفة

3. ✅ **نظام آمن لتحميل المفاتيح**:
   - `config/config-loader.js` - محمل آمن مع قيم افتراضية
   - أولوية التحميل: window variables → config.js → القيم الافتراضية

4. ✅ **تحديث .gitignore**:
   - `config.js` محمي من الرفع على GitHub
   - جميع الملفات الحساسة محمية

## 🚀 كيفية الاستخدام

### للاستخدام المحلي (التطوير):

1. انسخ ملف القالب:
```bash
cp config/config.example.js config.js
```

2. افتح `config.js` وأضف المفاتيح الحقيقية:
```javascript
const SUPABASE_CONFIG = {
  URL: 'https://your-project.supabase.co',
  ANON_KEY: 'your-anon-key-here'
};
```

3. افتح `index.html` أو `agents_growth_iraqcell.html` في المتصفح

### للاستخدام على GitHub Pages (الإنتاج):

#### الطريقة 1: استخدام window variables (موصى بها)

أضف هذا الكود قبل تحميل الصفحة:

```html
<script>
  window.SUPABASE_URL = 'https://your-project.supabase.co';
  window.SUPABASE_ANON_KEY = 'your-anon-key-here';
</script>
<script src="index.html"></script>
```

#### الطريقة 2: استخدام القيم الافتراضية

النظام سيستخدم القيم الافتراضية من `config-loader.js` (للاختبار فقط).

⚠️ **تحذير**: القيم الافتراضية للاختبار فقط. في الإنتاج يجب استخدام window variables.

## 🔒 الأمان

### الملفات المحمية (غير متتبعة في Git):
- ✅ `config.js` - ملف الإعدادات المحلي
- ✅ `backups/` - النسخ الاحتياطية
- ✅ `database_backups/` - نسخ قاعدة البيانات

### الملفات الآمنة (متتبعة في Git):
- ✅ `config/config-loader.js` - محمل الإعدادات (قيم افتراضية)
- ✅ `config/config.example.js` - قالب بدون مفاتيح
- ✅ `index.html` - لا يحتوي على مفاتيح
- ✅ `agents_growth_iraqcell.html` - لا يحتوي على مفاتيح

## 📋 التحقق من الأمان

للتأكد من عدم وجود مفاتيح مكشوفة:

```bash
# البحث عن المفاتيح في الملفات الرئيسية
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" index.html agents_growth_iraqcell.html
# يجب أن لا يعود بأي نتائج
```

## 🎯 الخطوات التالية

1. ✅ رفع التعديلات على GitHub
2. ✅ التأكد من عمل النظام على GitHub Pages
3. ✅ استخدام window variables في الإنتاج

## 📚 الملفات المرجعية

- `README.md` - دليل المشروع الرئيسي
- `SECURITY.md` - دليل الأمان التفصيلي
- `PROJECT_STRUCTURE.md` - هيكل المشروع
- `config/README.md` - توثيق الإعدادات

