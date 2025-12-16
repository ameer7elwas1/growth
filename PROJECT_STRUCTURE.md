# هيكل المشروع - Project Structure

## 📁 هيكل المجلدات

```
growth/
├── 📄 index.html                    # الصفحة الرئيسية
├── 📄 agents_growth_iraqcell.html   # صفحة الوكلاء
├── 📄 user_management_database.html  # إدارة المستخدمين
├── 📄 database_backup_tool.html     # أداة النسخ الاحتياطي
│
├── 📁 config/                       # ملفات الإعدادات
│   ├── config-loader.js            # محمل الإعدادات الآمن (يُرفع على GitHub)
│   ├── config.example.js           # قالب الإعدادات (يُرفع على GitHub)
│   └── README.md                   # توثيق الإعدادات
│
├── 📁 js/                          # ملفات JavaScript
│   └── app.js                      # الكود الرئيسي للتطبيق
│
├── 📁 css/                         # ملفات التنسيق
│   └── styles.css                  # الأنماط الرئيسية
│
├── 📁 scripts/                     # السكريبتات والأدوات
│   ├── *.ps1                       # ملفات PowerShell
│   ├── *.bat                       # ملفات Batch
│   └── README.md                   # توثيق السكريبتات
│
├── 📁 sql/                         # ملفات SQL
│   ├── migrate_*.sql               # ملفات الهجرة
│   ├── update_*.sql                # ملفات التحديث
│   └── README.md                   # توثيق SQL
│
├── 📁 backups/                     # النسخ الاحتياطية (غير متتبعة)
│   └── *.html                      # نسخ احتياطية من الملفات
│
├── 📁 database_backups/            # نسخ قاعدة البيانات (غير متتبعة)
│   └── *.json, *.html              # نسخ احتياطية من البيانات
│
├── 📄 config.js                    # ملف الإعدادات المحلي (غير متتبع)
├── 📄 .gitignore                   # ملفات مستثناة من Git
├── 📄 README.md                    # دليل المشروع الرئيسي
├── 📄 SECURITY.md                  # دليل الأمان
└── 📄 PROJECT_STRUCTURE.md         # هذا الملف
```

## 🔒 الأمان

### الملفات الحساسة (غير متتبعة في Git):
- `config.js` - ملف الإعدادات المحلي مع المفاتيح الحقيقية
- `config/config.js` - نسخة بديلة في مجلد config
- `backups/` - مجلد النسخ الاحتياطية
- `database_backups/` - مجلد نسخ قاعدة البيانات

### الملفات الآمنة (متتبعة في Git):
- `config/config-loader.js` - محمل الإعدادات (يحتوي على قيم افتراضية)
- `config/config.example.js` - قالب بدون مفاتيح حقيقية

## 📝 ملاحظات

1. **config.js**: يجب إنشاؤه محلياً من `config/config.example.js`
2. **config-loader.js**: يتم رفعه على GitHub ويحتوي على قيم افتراضية
3. **المفاتيح**: لا توجد مفاتيح مكشوفة في الملفات الرئيسية (index.html, agents_growth_iraqcell.html)

## 🚀 الاستخدام

### للاستخدام المحلي:
```bash
# انسخ القالب
cp config/config.example.js config.js
# أضف المفاتيح الحقيقية في config.js
```

### للاستخدام على GitHub Pages:
استخدم `window.SUPABASE_URL` و `window.SUPABASE_ANON_KEY` قبل تحميل الصفحة.

