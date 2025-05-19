// src/components/AppWrapper.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function AppWrapper({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

      if (!session && !isAuthPage) {
        navigate('/signin');
      } else if (session && isAuthPage) {
        navigate('/dashboard');
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, [location.pathname, navigate]);

  if (!authChecked) return null;

  return children;
}
