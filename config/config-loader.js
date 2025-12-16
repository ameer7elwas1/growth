/**
 * محمل الإعدادات الآمن - Safe Config Loader
 * 
 * هذا الملف يتحمّل إعدادات Supabase بشكل آمن
 * أولوية التحميل:
 * 1. window.SUPABASE_URL و window.SUPABASE_ANON_KEY (للإنتاج/GitHub Pages)
 * 2. SUPABASE_CONFIG من config.js (للاستخدام المحلي)
 * 3. القيم الافتراضية (للاختبار فقط - يجب استبدالها)
 */

(function() {
  'use strict';
  
  // ⚠️ ملاحظة أمنية: هذه القيم الافتراضية للاختبار فقط
  // يجب استبدالها في الإنتاج باستخدام window variables أو config.js
  const DEFAULT_SUPABASE_URL = 'https://vpvvjascwgivdjyyhzwp.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdnZqYXNjd2dpdmRqeXloendwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDYxMjYsImV4cCI6MjA2NTM4MjEyNn0.6AR2-MG4x9ugNTXe9jUqx-IwGEtj1m6MCYwQkTsSbUQ';
  
  /**
   * الحصول على إعدادات Supabase
   * @returns {Object} { URL: string, ANON_KEY: string }
   */
  function getSupabaseConfig() {
    // الأولوية 1: window variables (للإنتاج/GitHub Pages)
    if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
      return {
        URL: window.SUPABASE_URL,
        ANON_KEY: window.SUPABASE_ANON_KEY
      };
    }
    
    // الأولوية 2: SUPABASE_CONFIG من config.js (للاستخدام المحلي)
    if (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.URL && SUPABASE_CONFIG.ANON_KEY) {
      return {
        URL: SUPABASE_CONFIG.URL,
        ANON_KEY: SUPABASE_CONFIG.ANON_KEY
      };
    }
    
    // الأولوية 3: القيم الافتراضية (للاختبار فقط)
    // ⚠️ تحذير: في الإنتاج يجب استخدام window variables أو config.js
    console.warn('⚠️ استخدام القيم الافتراضية للإعدادات. يُنصح بتعيين window.SUPABASE_URL و window.SUPABASE_ANON_KEY');
    
    return {
      URL: DEFAULT_SUPABASE_URL,
      ANON_KEY: DEFAULT_SUPABASE_ANON_KEY
    };
  }
  
  // تصدير الإعدادات للاستخدام العام
  const config = getSupabaseConfig();
  window.SUPABASE_CONFIG_LOADED = {
    URL: config.URL,
    ANON_KEY: config.ANON_KEY
  };
  
  // للتوافق مع الكود القديم
  if (typeof SUPABASE_CONFIG === 'undefined') {
    window.SUPABASE_CONFIG = {
      URL: config.URL,
      ANON_KEY: config.ANON_KEY
    };
  }
})();

