// ملف الإعدادات - قالب للاستخدام
// انسخ هذا الملف إلى config.js وأضف المفاتيح الحقيقية
// ملف config.js موجود في .gitignore ولن يتم رفعه على GitHub

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
  ANON_KEY: window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE'
};

