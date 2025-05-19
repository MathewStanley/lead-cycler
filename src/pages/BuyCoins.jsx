import React, { useState } from 'react';
import supabase from '../supabaseClient';

export default function BuyCoins() {
  const [coinAmount, setCoinAmount] = useState(0);
  const [message, setMessage] = useState('');

  const handleAddCoins = async () => {
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('User not logged in.');
      return;
    }

    const { error } = await supabase.rpc('increment_coins', {
      user_id: user.id,
      coin_amount: coinAmount,
    });

    if (error) {
      console.error('Error adding coins:', error.message);
      setMessage('Failed to add coins.');
    } else {
      setMessage(`${coinAmount} coins successfully added!`);
      setCoinAmount(0);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Buy Coins</h1>

      {message && <p className="mb-4 text-center text-sm text-blue-700">{message}</p>}

      <input
        type="number"
        value={coinAmount}
        onChange={(e) => setCoinAmount(Number(e.target.value))}
        placeholder="Enter coin amount"
        className="w-full border px-4 py-2 rounded mb-4"
      />

      <button
        onClick={handleAddCoins}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Add Coins
      </button>
    </div>
  );
}