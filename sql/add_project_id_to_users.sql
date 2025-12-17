-- إضافة عمود project_id إلى جدول users
-- هذا العمود يستخدم لتمييز المستخدمين حسب المشروع
-- عند استخدام أكثر من مشروع في نفس قاعدة البيانات

-- 1) إضافة عمود project_id إذا لم يكن موجوداً
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'project_id'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN project_id TEXT NOT NULL DEFAULT 'growth_iraqcell';
    
    -- إضافة فهرس لتحسين الأداء
    CREATE INDEX IF NOT EXISTS idx_users_project_id ON public.users(project_id);
    
    RAISE NOTICE 'تم إضافة عمود project_id بنجاح';
  ELSE
    RAISE NOTICE 'عمود project_id موجود بالفعل';
  END IF;
END $$;

-- 2) تحديث المستخدمين الموجودين
-- ⚠️ مهم: قم بتشغيل هذا الأمر لتحديث المستخدمين الموجودين
-- ⚠️ غيّر 'growth_iraqcell' إلى معرف مشروعك إذا كان مختلفاً
-- ملاحظة: تم نقل هذا الأمر إلى ملف منفصل update_existing_users_project_id.sql
-- يمكنك تشغيله من هناك أو إلغاء التعليق من السطر التالي:
-- UPDATE public.users SET project_id = 'growth_iraqcell' WHERE project_id IS NULL OR project_id = '' OR project_id IS DISTINCT FROM 'growth_iraqcell';

-- 3) إضافة constraint للتأكد من أن project_id غير فارغ
ALTER TABLE public.users 
ALTER COLUMN project_id SET NOT NULL;

-- 4) إضافة comment للعمود
COMMENT ON COLUMN public.users.project_id IS 'معرف المشروع - يستخدم لتمييز المستخدمين حسب المشروع';

