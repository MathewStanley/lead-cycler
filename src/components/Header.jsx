import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function Header() {
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSessionAndProfile = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError.message);
        setLoading(false);
        return;
      }

      setSession(session);

      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.warn('No profile found for user:', session.user.id);
          setProfile(null);
        } else {
          setProfile(data);
        }
      }

      setLoading(false);
    };

    loadSessionAndProfile();
  }, []);

  const handleLogin = () => navigate('/signin');

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    } else {
      setProfile(null);
      setSession(null);
      navigate('/signin');
    }
  };

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md border-b border-black">

      {/* Logo */}
      <div className="flex items-center h-full">
  <img src="/logo.png" alt="Lead Cycler" className="h-14 ml-4" />

</div>


      {/* Right Side */}
      <div className="flex items-center gap-4">
        {loading ? null : !session ? (
          <button
            onClick={handleLogin}
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Log In
          </button>
        ) : (
          <>
            {/* Coin Count */}
            {profile ? (
              <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                <span className="text-lg">🪙</span>
                <span>{profile.coins ?? 0}</span>
              </div>
            ) : (
              <span className="text-sm text-red-500">No profile</span>
            )}
            <button
  onClick={() => navigate('/buy-coins')}
  className="text-sm px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
>
  Add Coins
</button>



            {/* Display Name */}
            <span className="font-medium">{profile?.name ?? 'User'}</span>

            {/* Avatar */}
           <img
  onClick={() => navigate('/edit-profile')}
  src={profile?.avatar_url || '/default-avatar.png'}
  alt="Avatar"
  className="w-8 h-8 rounded-full border cursor-pointer hover:scale-105 transition"
/>


            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
            >
              Log Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
