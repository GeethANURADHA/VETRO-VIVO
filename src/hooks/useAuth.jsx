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
    console.log("AuthProvider: Mounted, setting up auth listener...");

    // Safety timeout in case INITIAL_SESSION never fires or gets stuck
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn("AuthProvider: Safety timeout triggered. Forcing loading to false.");
        setLoading(false);
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log(`AuthProvider: Received event [${event}]. Session exists:`, !!session);

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          // Prevent duplicate fetchRole calls from racing events
          if (!fetchingRef.current) {
            console.log("AuthProvider: Fetching role...");
            fetchingRef.current = true;
            await fetchRole(session.user);
            fetchingRef.current = false;
          } else {
            console.log("AuthProvider: fetchRole already in progress, skipping.");
          }
        } else {
          console.log("AuthProvider: No user in session. Clearing state.");
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("AuthProvider: User signed out. Clearing state.");
        setUser(null);
        setRole(null);
        setLoading(false);
      }
      
      clearTimeout(safetyTimer);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const fetchRole = async (currUser) => {
    try {
      console.log("AuthProvider: Querying users table for role...");
      
      // Add a race condition to prevent hanging forever
      const fetchPromise = supabase.from('users').select('role').eq('id', currUser.id).single();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase request timed out after 10 seconds')), 10000)
      );
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
        
      if (error) {
        if (error.code === 'PGRST116') {
          console.log("AuthProvider: Profile not found (PGRST116). Creating default profile...");
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
        console.log("AuthProvider: Role fetched successfully:", data.role);
        setRole(data.role);
      } else {
        console.log("AuthProvider: No data and no error. Defaulting to user.");
        setRole('user');
      }
    } catch (err) {
      console.error("AuthProvider: fetchRole exception:", err.message);
      setRole(prev => prev || 'user');
    } finally {
      console.log("AuthProvider: Setting loading to false.");
      setLoading(false);
    }
  };

  const value = useMemo(() => ({
    user, 
    role, 
    loading, 
    signOut: async () => {
      console.log("AuthProvider: Initiating sign out...");
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
