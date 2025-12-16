# 🔒 دليل الأمان - Security Guide

## حماية مفاتيح Supabase

### ما هي المفاتيح الموجودة في الكود؟

المفاتيح الموجودة في الكود هي **ANON KEY** (مفتاح عام) من Supabase:
- ✅ **آمنة نسبياً** للاستخدام العام
- ✅ مقيدة بسياسات **Row Level Security (RLS)** في Supabase
- ✅ لا تسمح بالوصول الكامل إلى قاعدة البيانات

### ⚠️ ما يجب تجنبه:

- ❌ **لا تستخدم service_role key** أبداً في الكود المصدري
- ❌ لا ترفع `config.js` على GitHub (موجود في `.gitignore`)
- ❌ لا تشارك service_role key مع أي شخص

---

## طرق إدارة المفاتيح

### الطريقة 1: للاستخدام المحلي (الأفضل)

1. انسخ `config.example.js` إلى `config.js`
2. أضف المفاتيح الحقيقية من Supabase Dashboard
3. الملف `config.js` موجود في `.gitignore` ولن يُرفع على GitHub

```javascript
// config.js
const SUPABASE_CONFIG = {
  URL: 'https://your-project.supabase.co',
  ANON_KEY: 'your-anon-key-here'
};
```

### الطريقة 2: للاستخدام على GitHub Pages

بما أن `config.js` لن يكون متاحاً على GitHub، يمكنك استخدام **window variables**:

#### أ) إضافة script tag في HTML:

أضف هذا الكود قبل تحميل `config.js`:

```html
<script>
  // ضع المفاتيح هنا (قبل تحميل config.js)
  window.SUPABASE_URL = 'https://your-project.supabase.co';
  window.SUPABASE_ANON_KEY = 'your-anon-key-here';
</script>
<script src="config.js"></script>
```

#### ب) استخدام GitHub Secrets (للإنتاج المتقدم):

يمكنك استخدام GitHub Actions لضبط متغيرات البيئة:

```yaml
# .github/workflows/deploy.yml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

---

## 🔑 الحصول على المفاتيح من Supabase

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك
3. اذهب إلى **Settings** → **API**
4. انسخ:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY`

⚠️ **لا تنسخ service_role key** - هذا المفتاح حساس جداً ويجب عدم استخدامه في الكود المصدري.

---

## 📋 قائمة التحقق الأمنية

- [ ] `config.js` موجود في `.gitignore`
- [ ] `config.example.js` موجود كقالب بدون المفاتيح الحقيقية
- [ ] المفاتيح المستخدمة هي **anon key** فقط (ليست service_role)
- [ ] تم تفعيل **Row Level Security (RLS)** في Supabase
- [ ] تم مراجعة سياسات RLS للتأكد من أنها مقيدة بشكل صحيح

---

## 🆘 في حالة تسريب المفاتيح

إذا تم تسريب المفاتيح عن طريق الخطأ:

1. **غيّر المفاتيح فوراً** في Supabase Dashboard:
   - Settings → API → Reset API keys
2. **راجع سجلات الوصول** في Supabase للتأكد من عدم وجود وصول غير مصرح به
3. **حدّث المفاتيح** في جميع الأماكن المستخدمة

---

## 📚 موارد إضافية

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

