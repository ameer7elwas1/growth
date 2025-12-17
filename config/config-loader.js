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
  
  // ⚠️ ملاحظة أمنية: هذه القيم الافتراضية هي placeholders فقط
  // ⚠️ يجب استبدالها في الإنتاج باستخدام window variables أو config.js
  // ⚠️ لا تستخدم هذه القيم في الإنتاج - يجب تعيين window.SUPABASE_URL و window.SUPABASE_ANON_KEY
  const DEFAULT_SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
  const DEFAULT_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
  
  /**
   * الحصول على إعدادات Supabase
   * @returns {Object} { URL: string, ANON_KEY: string }
   */
  function getSupabaseConfig() {
    // الأولوية 1: window variables (للإنتاج/GitHub Pages)
    if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY && 
        window.SUPABASE_URL !== '' && window.SUPABASE_ANON_KEY !== '' &&
        window.SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && 
        window.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
      return {
        URL: window.SUPABASE_URL,
        ANON_KEY: window.SUPABASE_ANON_KEY
      };
    }
    
    // الأولوية 2: SUPABASE_CONFIG من config.js (للاستخدام المحلي)
    // التحقق من وجود SUPABASE_CONFIG في النطاق العام
    // محاولة الوصول إلى SUPABASE_CONFIG من window أيضاً
    let configSource = null;
    
    // محاولة الوصول من window أولاً (الأسرع)
    if (window.SUPABASE_CONFIG) {
      configSource = window.SUPABASE_CONFIG;
    } 
    // ثم من النطاق العام
    else if (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG) {
      configSource = SUPABASE_CONFIG;
    }
    
    if (configSource) {
      // التحقق من أن القيم موجودة وليست placeholders
      const url = configSource.URL || (configSource.url || '');
      const key = configSource.ANON_KEY || (configSource.anonKey || configSource.anon_key || '');
      
      if (url && 
          url !== 'YOUR_SUPABASE_URL_HERE' &&
          url !== '' &&
          key && 
          key !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
          key !== '') {
        return {
          URL: url,
          ANON_KEY: key
        };
      }
    }
    
    // الأولوية 3: القيم الافتراضية (placeholders فقط - لن تعمل)
    // ⚠️ تحذير: هذه القيم هي placeholders ولن تعمل في الإنتاج
    // ⚠️ يجب استخدام window variables أو config.js
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.protocol === 'file:' ||
                    !window.location.hostname;
    
    // تحذير واضح في حالة استخدام القيم الافتراضية
    if (DEFAULT_SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' || 
        DEFAULT_SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
      // فقط أظهر الخطأ مرة واحدة، وليس في كل محاولة
      if (!window._CONFIG_ERROR_SHOWN) {
        console.error('❌ [خطأ] لم يتم تعيين إعدادات Supabase!');
        console.error('❌ يجب تعيين window.SUPABASE_URL و window.SUPABASE_ANON_KEY');
        console.error('❌ أو إنشاء ملف config.js في المجلد الرئيسي');
        console.error('❌ راجع config/config.example.js للتعليمات');
        window._CONFIG_ERROR_SHOWN = true;
      }
      
      // إرجاع قيم فارغة لتجنب الأخطاء
      return {
        URL: '',
        ANON_KEY: ''
      };
    }
    
    if (isLocal) {
      console.warn('⚠️ [تحذير] استخدام القيم الافتراضية من config-loader.js');
      console.warn('⚠️ يجب استخدام window variables أو config.js للإنتاج');
    }
    
    return {
      URL: DEFAULT_SUPABASE_URL,
      ANON_KEY: DEFAULT_SUPABASE_ANON_KEY
    };
  }
  
  // دالة لتحديث الإعدادات
  function updateConfig() {
    const config = getSupabaseConfig();
    
    window.SUPABASE_CONFIG_LOADED = {
      URL: config.URL,
      ANON_KEY: config.ANON_KEY
    };
    
    // للتوافق مع الكود القديم
    // إذا كان SUPABASE_CONFIG موجوداً، استخدمه مباشرة
    if (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG) {
      // نسخ PROJECT_ID إذا كان موجوداً
      window.SUPABASE_CONFIG = {
        URL: config.URL,
        ANON_KEY: config.ANON_KEY,
        PROJECT_ID: SUPABASE_CONFIG.PROJECT_ID || 'growth_iraqcell'
      };
      // إضافة PROJECT_ID إلى SUPABASE_CONFIG_LOADED
      if (SUPABASE_CONFIG.PROJECT_ID) {
        window.SUPABASE_CONFIG_LOADED.PROJECT_ID = SUPABASE_CONFIG.PROJECT_ID;
      }
    } else {
      window.SUPABASE_CONFIG = {
        URL: config.URL,
        ANON_KEY: config.ANON_KEY
      };
    }
    
    return config;
  }
  
  // دالة لمحاولة تحميل الإعدادات مع إعادة المحاولة
  function loadConfigWithRetry(maxRetries, delay) {
    maxRetries = maxRetries || 10;
    delay = delay || 100;
    let attempts = 0;
    let success = false;
    
    function tryLoad() {
      attempts++;
      const config = updateConfig();
      
      // التحقق من نجاح التحميل
      if (config.URL && config.ANON_KEY && 
          config.URL !== '' && config.ANON_KEY !== '' &&
          config.URL !== 'YOUR_SUPABASE_URL_HERE' && 
          config.ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
        if (!success) {
          console.log('✅ تم تحميل إعدادات Supabase بنجاح');
          if (attempts > 1) {
            console.log('   (بعد ' + attempts + ' محاولة)');
          }
          success = true;
        }
        return true;
      }
      
      // إذا لم تنجح ولم نتجاوز الحد الأقصى للمحاولات
      if (attempts < maxRetries) {
        setTimeout(tryLoad, delay);
        return false;
      }
      
      // إذا فشلت جميع المحاولات (فقط أظهر مرة واحدة)
      if (!success && !window._CONFIG_LOAD_FAILED) {
        console.error('❌ فشل تحميل إعدادات Supabase بعد ' + attempts + ' محاولات');
        window._CONFIG_LOAD_FAILED = true;
      }
      return false;
    }
    
    return tryLoad();
  }
  
  // محاولة تحميل الإعدادات فوراً
  let config = updateConfig();
  
  // إذا لم يتم العثور على الإعدادات، حاول مرة أخرى
  if (!config.URL || !config.ANON_KEY || 
      config.URL === '' || config.ANON_KEY === '' ||
      config.URL === 'YOUR_SUPABASE_URL_HERE' || 
      config.ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    // انتظر قليلاً لتحميل config.js ثم حاول
    setTimeout(function() {
      loadConfigWithRetry(10, 100);
    }, 100);
  } else {
    console.log('✅ تم تحميل إعدادات Supabase بنجاح');
  }
})();

