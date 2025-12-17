-- إصلاح مشكلة enum user_role
-- هذا الملف يحل مشكلة الخطأ: invalid input value for enum user_role: "supervisor"

-- 1) التحقق من نوع العمود الحالي
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'role';

-- 2) إذا كان العمود من نوع enum، نحتاج إلى تغييره إلى TEXT مع CHECK constraint
-- أولاً: نسخ البيانات الموجودة
DO $$ 
DECLARE
    enum_type_name TEXT;
BEGIN
    -- البحث عن اسم enum type
    SELECT t.typname INTO enum_type_name
    FROM pg_type t 
    JOIN pg_attribute a ON a.atttypid = t.oid
    JOIN pg_class c ON c.oid = a.attrelid
    WHERE c.relname = 'users' 
      AND a.attname = 'role'
      AND t.typtype = 'e';
    
    -- إذا كان enum موجوداً
    IF enum_type_name IS NOT NULL THEN
        -- تغيير العمود إلى TEXT مؤقتاً
        ALTER TABLE public.users ALTER COLUMN role TYPE TEXT;
        
        -- حذف enum type
        DROP TYPE IF EXISTS user_role CASCADE;
        
        -- إضافة CHECK constraint
        ALTER TABLE public.users 
        ADD CONSTRAINT users_role_check 
        CHECK (role IN ('admin', 'supervisor', 'viewer'));
        
        RAISE NOTICE 'تم تحويل role من enum إلى TEXT مع CHECK constraint';
    ELSE
        -- إذا كان TEXT بالفعل، نتأكد من وجود CHECK constraint
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'users_role_check'
        ) THEN
            ALTER TABLE public.users 
            ADD CONSTRAINT users_role_check 
            CHECK (role IN ('admin', 'supervisor', 'viewer'));
            
            RAISE NOTICE 'تم إضافة CHECK constraint للعمود role';
        ELSE
            RAISE NOTICE 'العمود role صحيح بالفعل';
        END IF;
    END IF;
END $$;

-- 3) التحقق من النتيجة
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'role';

-- 4) التحقق من القيم الموجودة
SELECT DISTINCT role FROM public.users ORDER BY role;

