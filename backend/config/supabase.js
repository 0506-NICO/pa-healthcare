// ============================================
// SUPABASE CONFIGURATION
// Centralized database connection
// ============================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get credentials (trim any accidental spaces)
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

// Use service key first (has more permissions), fallback to anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

let supabase = null;
let isConnected = false;

if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: false
            }
        });
        
        // Test connection
        const testConnection = async () => {
            try {
                const { error } = await supabase.from('appointments').select('count', { count: 'exact', head: true });
                if (error) {
                    console.log('⚠️  Supabase test query failed:', error.message);
                } else {
                    isConnected = true;
                    console.log('✅ Supabase connection verified');
                }
            } catch (e) {
                console.log('⚠️  Supabase test failed:', e.message);
            }
        };
        
        testConnection();
        
    } catch (error) {
        console.log('❌ Supabase initialization failed:', error.message);
    }
} else {
    console.log('⚠️  Supabase not configured - missing URL or KEY');
    console.log('   SUPABASE_URL:', supabaseUrl ? 'set' : 'missing');
    console.log('   SUPABASE_KEY:', supabaseKey ? 'set' : 'missing');
}

// Helper function to check connection
const checkConnection = () => isConnected;

// Export
module.exports = {
    supabase,
    checkConnection
};
