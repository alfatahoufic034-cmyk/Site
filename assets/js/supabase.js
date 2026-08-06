const SUPABASE_URL = "https://sgkmcvvgfdajopfvuazv.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNna21jdnZnZmRham9wZnZ1YXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjE0OTIsImV4cCI6MjA5MTk5NzQ5Mn0.m8sNHz9XXAjlAFgZ5a-15tm-tOHEs80oGdm1TVpNnL8";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);