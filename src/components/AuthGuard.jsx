import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      if (!session && location.pathname !== '/signin' && location.pathname !== '/signup') {
        navigate('/signin');
      }
    };

    checkSession();
  }, [navigate, location.pathname]);

  if (loading) return null;

  return children;
}
