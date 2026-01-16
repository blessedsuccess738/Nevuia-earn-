
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import { ADMIN_EMAIL } from '../constants';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <nav className="glass-card sticky top-0 z-[70] px-4 py-4 flex items-center justify-between border-b border-white/10 shadow-2xl max-w-md mx-auto w-full">
      <Link to="/dashboard" className="flex items-center gap-3 group active:scale-95 transition-all">
        <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
          <i className="fas fa-headphones text-black text-xl"></i>
        </div>
        <div className="flex flex-col">
           <span className="font-black text-lg tracking-tighter neon-glow leading-none uppercase italic">BEATBUCKS</span>
           <span className="text-[7px] font-black text-green-500 uppercase tracking-[0.2em]">Android OS v3</span>
        </div>
      </Link>
      
      <div className="flex items-center gap-2">
        {user.email === ADMIN_EMAIL && (
          <Link 
            to="/admin" 
            className={`px-3 py-2 rounded-xl border font-black text-[8px] uppercase tracking-widest transition-all ${
              location.pathname === '/admin'
                ? 'bg-white text-black border-white'
                : 'border-white/20 text-white hover:bg-white/10'
            }`}
          >
            ADMIN
          </Link>
        )}

        <button 
          onClick={onLogout}
          className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center transition-all text-gray-500 hover:text-red-500 border border-white/5 active:scale-90"
        >
          <i className="fas fa-power-off text-xs"></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
