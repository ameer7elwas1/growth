-- تحديث قاعدة البيانات الموجودة - إضافة عمود reached_total
-- قم بنسخ هذا الكود وتشغيله في Supabase SQL Editor إذا كانت قاعدة البيانات موجودة بالفعل

-- 1) إضافة عمود reached_total إلى جدول agents (إذا لم يكن موجوداً)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name = 'reached_total'
    ) THEN
        ALTER TABLE public.agents 
        ADD COLUMN reached_total INTEGER NOT NULL DEFAULT 0 CHECK (reached_total >= 0);
        
        -- تحديث البيانات الموجودة: استخدام active كقيمة افتراضية لـ reached_total
        UPDATE public.agents 
        SET reached_total = active 
        WHERE reached_total = 0 AND active > 0;
        
        RAISE NOTICE 'تم إضافة عمود reached_total بنجاح';
    ELSE
        RAISE NOTICE 'عمود reached_total موجود بالفعل';
    END IF;
END $$;

-- 2) إضافة عمود phone إذا لم يكن موجوداً (لأن الكود يستخدمه)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'agents' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.agents 
        ADD COLUMN phone TEXT;
        
        RAISE NOTICE 'تم إضافة عمود phone بنجاح';
    ELSE
        RAISE NOTICE 'عمود phone موجود بالفعل';
    END IF;
END $$;

-- 3) التحقق من البيانات المحدثة
SELECT 
    id,
    name,
    phase,
    total_users,
    reached_total,
    active,
    (reached_total - active) as expired,
    board_name
FROM public.agents 
ORDER BY phase, name
LIMIT 10;

-- 4) عرض إحصائيات
SELECT 
    phase,
    COUNT(*) as total_agents,
    SUM(total_users) as total_users_sum,
    SUM(reached_total) as total_reached_sum,
    SUM(active) as total_active_sum,
    SUM(reached_total - active) as total_expired_sum
FROM public.agents
GROUP BY phase
ORDER BY phase;

