import { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef            = useRef(true);

  const fetchRole = useCallback(async (currUser) => {
    if (!mountedRef.current) return;
    setLoading(true); // Ensure loading is true while we fetch
    console.log('AuthProvider: Querying users table for role...');
    try {
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
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Fallback timer to prevent getting stuck if Supabase fails silently
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current && loading) {
        setLoading(false);
      }
    }, 10000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        clearTimeout(safetyTimer);

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user);
            await fetchRole(session.user);
          } else {
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

