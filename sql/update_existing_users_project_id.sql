-- تحديث المستخدمين الموجودين لربطهم بمشروع معين
-- ⚠️ مهم: قم بتشغيل هذا الملف بعد إضافة عمود project_id

-- 1) تحديث جميع المستخدمين الذين لا يملكون project_id أو لديهم قيمة فارغة
-- ⚠️ غيّر 'growth_iraqcell' إلى معرف مشروعك إذا كان مختلفاً
UPDATE public.users 
SET project_id = 'growth_iraqcell' 
WHERE project_id IS NULL 
   OR project_id = '' 
   OR TRIM(project_id) = '';

-- 2) التحقق من النتيجة
SELECT 
  project_id, 
  COUNT(*) as user_count 
FROM public.users 
GROUP BY project_id 
ORDER BY project_id;

-- 3) عرض عينة من المستخدمين للتأكد
SELECT id, username, full_name, project_id 
FROM public.users 
ORDER BY id 
LIMIT 10;

