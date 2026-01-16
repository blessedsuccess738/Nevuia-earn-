
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
    <nav className="glass-card sticky top-0 z-[70] px-4 py-4 flex items-center justify-between border-b border-white/10 shadow-2xl max-w-md mx-auto w-full">
      <Link to="/dashboard" className="flex items-center gap-3 group">
        <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-active:scale-90 transition-all">
          <img src={SPOTIFY_PNG} className="w-6 h-6 object-contain" alt="Logo" />
        </div>
        <div className="flex flex-col">
           <span className="font-black text-base tracking-tighter neon-glow leading-none">BEATBUCKS</span>
           <span className="text-[7px] font-black text-green-500 uppercase tracking-[0.2em]">Earner OS</span>
        </div>
      </Link>
      
      <div className="flex items-center gap-2">
        {user.email === ADMIN_EMAIL && (
          <Link 
            to="/admin" 
            className={`px-3 py-2 rounded-lg border font-black text-[8px] uppercase tracking-widest transition-all ${
              location.pathname === '/admin'
                ? 'bg-green-500 text-black border-green-500'
                : 'border-green-500/50 text-green-500 hover:bg-green-500/10'
            }`}
          >
            ADMIN
          </Link>
        )}

        <button 
          onClick={onLogout}
          className="w-9 h-9 bg-white/5 hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-all text-gray-500 hover:text-red-500 border border-white/5"
          title="Exit Session"
        >
          <i className="fas fa-power-off text-xs"></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
