
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import { ADMIN_EMAIL, SPOTIFY_PNG } from '../constants';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="glass-card sticky top-0 z-[70] px-6 py-4 flex items-center justify-between border-b border-white/10 shadow-2xl">
      <Link to="/dashboard" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-active:scale-90 transition-all">
          <img src={SPOTIFY_PNG} className="w-6 h-6 object-contain" alt="Logo" />
        </div>
        <div className="flex flex-col">
           <span className="font-black text-lg tracking-tighter neon-glow leading-none">BEATBUCKS</span>
           <span className="text-[8px] font-black text-green-500 uppercase tracking-[0.3em]">Global Network</span>
        </div>
      </Link>
      
      <div className="flex items-center gap-4">
        {user.email === ADMIN_EMAIL && (
          <Link 
            to="/admin" 
            className={`px-5 py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${
              location.pathname === '/admin'
                ? 'bg-green-500 text-black border-green-500 shadow-lg shadow-green-500/20'
                : 'border-green-500/50 text-green-500 hover:bg-green-500/10'
            }`}
          >
            ADMIN PANEL
          </Link>
        )}

        <button 
          onClick={onLogout}
          className="w-10 h-10 bg-white/5 hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-all text-gray-400 hover:text-red-500 border border-white/5"
          title="Logout"
        >
          <i className="fas fa-power-off text-sm"></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
