import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Live Leads', path: '/live-leads' },
  { name: 'Aged Leads', path: '/aged-leads' },
  { name: 'Campaigns', path: '/campaigns' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'Sell Leads', path: '/sell-leads' },
];

export default function Sidebar() {
  return (
    <div className="w-48 h-screen bg-white border-r border-black flex flex-col">
      {navItems.map((item, index) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `text-center font-bold py-4 border-b border-black uppercase ${
              isActive ? 'bg-blue-400 text-white' : 'bg-white text-black'
            }`
          }
        >
          {item.name}
        </NavLink>
      ))}
    </div>
  );
}
