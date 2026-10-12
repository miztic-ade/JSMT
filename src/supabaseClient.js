import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = "https://epzrhvhyafscbjohssfv.supabase.co";
export const SUPABASE_KEY = "sb_publishable_Wmp1iytPdjsoyiNUtHpyXg_LWJ-k6xi";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
