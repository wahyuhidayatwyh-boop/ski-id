import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors when env vars are not available
let _supabase: SupabaseClient | null = null;

const getSupabaseUrl = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
        // Return a placeholder during build if env var is not set
        return process.env.VERCEL ? '' : 'https://placeholder.supabase.co';
    }
    return url;
};

const getSupabaseAnonKey = () => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) {
        // Return a placeholder during build if env var is not set
        return process.env.VERCEL ? '' : 'placeholder-anon-key';
    }
    return key;
};

// Create a mock client for build time when env vars are not available
const createMockSupabase = () => {
    const mockQuery = () => ({
        eq: () => ({
            single: async () => ({ data: null, error: null }),
            limit: async () => ({ data: [], error: null })
        }),
        neq: () => ({
            order: () => ({
                limit: async () => ({ data: [], error: null })
            })
        }),
        order: () => ({
            limit: async () => ({ data: [], error: null })
        }),
        limit: async () => ({ data: [], error: null }),
        single: async () => ({ data: null, error: null }),
    });

    return {
        from: (_table: string) => ({
            select: () => mockQuery(),
            insert: () => ({ select: () => mockQuery() }),
            update: () => ({ eq: () => ({ select: () => mockQuery() }) }),
            delete: () => ({ eq: () => ({ select: () => mockQuery() }) }),
        }),
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        },
        storage: {
            from: () => ({
                upload: async () => ({ data: null, error: null }),
                list: async () => ({ data: [], error: null }),
                remove: async () => ({ data: null, error: null }),
                getPublicUrl: () => ({ data: { publicUrl: '' } }),
            }),
        },
    } as unknown as SupabaseClient;
};

// Lazy supabase client that only initializes when first used
export const supabase = new Proxy({} as SupabaseClient, {
    get(target, prop) {
        if (!_supabase) {
            const url = getSupabaseUrl();
            const key = getSupabaseAnonKey();

            if (!url || !key) {
                // Return mock client during build
                return createMockSupabase()[prop as keyof SupabaseClient];
            }

            _supabase = createBrowserClient(url, key);
        }

        const value = (_supabase as any)[prop];
        if (typeof value === 'function') {
            return value.bind(_supabase);
        }
        return value;
    }
});

export const getServerSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        // Return a mock client during build if env vars are not set
        return createMockSupabase();
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey);
};