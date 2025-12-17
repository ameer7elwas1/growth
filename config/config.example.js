// ملف الإعدادات - قالب للاستخدام
// انسخ هذا الملف إلى config.js في المجلد الرئيسي وأضف المفاتيح الحقيقية
// ملف config.js موجود في .gitignore ولن يتم رفعه على GitHub
// المسار: config.js (في المجلد الرئيسي، ليس في مجلد config/)

// يمكنك استخدام متغيرات البيئة أو window variables للإنتاج
// للاستخدام على GitHub Pages، يمكنك تعيين window.SUPABASE_URL و window.SUPABASE_ANON_KEY
// قبل تحميل الصفحة باستخدام script tag:
// <script>
//   window.SUPABASE_URL = 'your-supabase-url';
//   window.SUPABASE_ANON_KEY = 'your-anon-key';
// </script>

const SUPABASE_CONFIG = {
  // استبدل بالقيم الحقيقية من Supabase Dashboard
  URL: window.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE',
  ANON_KEY: window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE',
  // معرف المشروع - يستخدم لتصفية المستخدمين والبيانات حسب المشروع
  // يجب أن يكون فريداً لكل مشروع يستخدم نفس قاعدة البيانات
  PROJECT_ID: window.PROJECT_ID || 'YOUR_PROJECT_ID_HERE'
};

