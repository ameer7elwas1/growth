# نظام متابعة الوكلاء - Agents Growth Iraqcell

نظام إدارة ومتابعة الوكلاء لشركة عراق سيل - قسم العمليات التجارية

## المميزات

- 📊 لوحة تحكم شاملة مع إحصائيات مباشرة
- 📈 رسوم بيانية تفاعلية للتحليل
- 🔐 نظام مصادقة متقدم
- 📱 تصميم متجاوب يعمل على جميع الأجهزة
- 🌙 دعم الوضع الداكن
- 📧 نظام إشعارات متقدم
- 📄 تقارير قابلة للطباعة

## التثبيت والإعداد

1. استنسخ المستودع:
```bash
git clone https://github.com/ameer7elwas1/growth.git
cd growth
```

2. قم بإعداد ملف الإعدادات:
```bash
cp config.example.js config.js
```

3. افتح `config.js` وأضف مفاتيح Supabase الخاصة بك:
```javascript
const SUPABASE_CONFIG = {
  URL: 'YOUR_SUPABASE_URL_HERE',
  ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE'
};
```

4. افتح `agents_growth_iraqcell.html` في المتصفح

## الأمان

- ✅ مفاتيح Supabase محمية في ملف `config.js` (موجود في `.gitignore`)
- ✅ استخدام `textContent` بدلاً من `innerHTML` في معظم الأماكن
- ✅ نظام إشعارات آمن بدلاً من `alert()`
- ✅ إزالة `console.log` من الإنتاج

## الملفات

- `agents_growth_iraqcell.html` - الملف الرئيسي للتطبيق
- `config.js` - ملف الإعدادات (غير موجود في Git)
- `config.example.js` - مثال لملف الإعدادات
- `notifications.js` - نظام الإشعارات
- `.gitignore` - ملفات مستثناة من Git

## التحديثات الأخيرة

### إصلاحات الأمان والأداء (2025-01-16)
- ✅ نقل مفاتيح Supabase إلى ملف منفصل
- ✅ استبدال `alert()` بنظام إشعارات متقدم
- ✅ إزالة `console.log` و `console.error` من الإنتاج
- ✅ تحسين معالجة الأخطاء
- ✅ إضافة `.gitignore` لحماية المفاتيح

## المتطلبات

- متصفح حديث يدعم ES6+
- اتصال بالإنترنت (لتحميل الخطوط والمكتبات)
- حساب Supabase (لحفظ البيانات)

## الرخصة

© 2025 عراق سيل - جميع الحقوق محفوظة

## الدعم

للتواصل والدعم:
- Email: ameeralgaraawi@hotmail.com
- Instagram: [@ameer_7elwas](https://instagram.com/ameer_7elwas)
- Telegram: [@ameer_7elwas](https://t.me/ameer_7elwas)
- WhatsApp: [9647701024143](https://wa.me/9647701024143)

