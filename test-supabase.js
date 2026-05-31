import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Fetching gems...");
  const { data: catData, error: catError } = await supabase
    .from("categories")
    .select("*")
    .limit(4);
  
  if (catError) {
    console.error("Error fetching categories:", catError);
  } else {
    console.log("Success! Categories fetched:", catData);
  }
}

test();
