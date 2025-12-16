# مجلد الإعدادات - Config Directory

هذا المجلد يحتوي على ملفات الإعدادات والنظام الآمن لتحميل المفاتيح.

## الملفات

- `config-loader.js` - محمل الإعدادات الآمن (يتم رفعه على GitHub)
- `config.example.js` - قالب ملف الإعدادات (بدون المفاتيح الحقيقية)

## الاستخدام

### للاستخدام المحلي:
1. انسخ `config.example.js` إلى `config.js` في المجلد الرئيسي
2. أضف المفاتيح الحقيقية

### للاستخدام على GitHub Pages:
استخدم `window.SUPABASE_URL` و `window.SUPABASE_ANON_KEY` قبل تحميل الصفحة.

## الأمان

- `config.js` موجود في `.gitignore` ولن يُرفع على GitHub
- `config-loader.js` يحتوي على قيم افتراضية للاختبار فقط
- في الإنتاج يجب استخدام window variables أو config.js محلي

