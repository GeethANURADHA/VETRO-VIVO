import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Use ONLY onAuthStateChange — avoids the lock conflict with getSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          // Prevent duplicate fetchRole calls from racing events
          if (!fetchingRef.current) {
            fetchingRef.current = true;
            await fetchRole(session.user);
            fetchingRef.current = false;
          }
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
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchRole = async (currUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', currUser.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile row doesn't exist yet — auto-create it
          const { error: insError } = await supabase.from('users').insert({
            id: currUser.id,
            email: currUser.email,
            name: currUser.user_metadata?.name || currUser.email.split('@')[0],
            role: 'user'
          });
          if (insError) console.error("AuthProvider: Profile insert error:", insError.message);
          setRole('user');
        } else {
          console.error("AuthProvider: Role query error:", error.message);
          setRole('user');
        }
      } else if (data) {
        setRole(data.role);
      } else {
        setRole('user');
      }
    } catch (err) {
      console.error("AuthProvider: fetchRole exception:", err.message);
      setRole(prev => prev || 'user');
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(() => ({
    user, 
    role, 
    loading, 
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
    }
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
