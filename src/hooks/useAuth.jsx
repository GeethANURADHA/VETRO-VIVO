import { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef           = useRef(false);
  // Keep a ref so the async fetchRole can see the latest "mounted" state
  const mountedRef            = useRef(true);

  const fetchRole = useCallback(async (currUser) => {
    console.log('AuthProvider: Querying users table for role...');
    try {
      // maybeSingle() returns null (not PGRST116) when no row is found
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', currUser.id)
        .maybeSingle();

      if (!mountedRef.current) return;

      if (error) {
        console.error('AuthProvider: Role query error:', error.message);
        setRole('user');
        return;
      }

      if (data) {
        console.log('AuthProvider: Role fetched successfully:', data.role);
        setRole(data.role);
        return;
      }

      // No row yet – create a default profile (only for brand-new auth users)
      console.log('AuthProvider: No profile found. Creating default profile...');
      const { error: insError } = await supabase.from('users').insert({
        id:    currUser.id,
        email: currUser.email,
        name:  currUser.user_metadata?.name || currUser.email.split('@')[0],
        role:  'user',
      });
      if (insError) console.error('AuthProvider: Profile insert error:', insError.message);
      if (mountedRef.current) setRole('user');

    } catch (err) {
      console.error('AuthProvider: fetchRole exception:', err.message);
      if (mountedRef.current) setRole('user');
    } finally {
      if (mountedRef.current) {
        console.log('AuthProvider: Setting loading to false.');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    console.log('AuthProvider: Mounted, setting up auth listener...');

    // Safety net – fires only if no auth event arrives at all (very rare network issue)
    // Set to 15 s so it does NOT race with the normal DB query
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current) {
        console.warn('AuthProvider: Safety timeout triggered. Forcing loading to false.');
        setLoading(false);
      }
    }, 15000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        console.log(`AuthProvider: Received event [${event}]. Session exists:`, !!session);

        // Clear safety timer as soon as we receive any auth event
        clearTimeout(safetyTimer);

        if (
          event === 'INITIAL_SESSION' ||
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED'
        ) {
          if (session?.user) {
            setUser(session.user);
            if (!fetchingRef.current) {
              fetchingRef.current = true;
              await fetchRole(session.user);
              fetchingRef.current = false;
            } else {
              console.log('AuthProvider: fetchRole already in progress, skipping.');
            }
          } else {
            // No session — unauthenticated state
            setUser(null);
            setRole(null);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  const value = useMemo(() => ({
    user,
    role,
    loading,
    isAdmin: role === 'admin' || role === 'main_admin',
    signOut: async () => {
      console.log('AuthProvider: Initiating sign out...');
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
    },
  }), [user, role, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
