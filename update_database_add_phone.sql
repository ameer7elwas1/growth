-- إضافة عمود phone إلى جدول agents
-- قم بنسخ هذا الكود وتشغيله في Supabase SQL Editor

-- إضافة عمود phone إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.agents ADD COLUMN phone TEXT;
        RAISE NOTICE 'تم إضافة عمود phone بنجاح';
    ELSE
        RAISE NOTICE 'عمود phone موجود بالفعل';
    END IF;
END $$;

-- التحقق من وجود العمود
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'agents' 
AND column_name = 'phone';

