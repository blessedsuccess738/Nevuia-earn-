
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { ADMIN_EMAIL } from '../constants';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="glass-card sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-white/10">
      <Link to="/dashboard" className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <i className="fas fa-headphones text-black text-sm"></i>
        </div>
        <span className="font-bold text-xl tracking-tighter neon-glow">BEATBUCKS</span>
      </Link>
      
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
        <Link to="/listen" className="text-gray-400 hover:text-white transition-colors">Listen & Earn</Link>
        <Link to="/activation" className="text-gray-400 hover:text-white transition-colors">Activation</Link>
        <Link to="/withdraw" className="text-gray-400 hover:text-white transition-colors">Withdraw</Link>
        {user.email === ADMIN_EMAIL && (
          <Link to="/admin" className="text-green-500 hover:text-green-400 transition-colors font-semibold">Admin</Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-500 leading-none">Balance</p>
          <p className="text-sm font-bold text-green-500">${user.balanceUSD.toFixed(2)}</p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all text-gray-400 hover:text-red-500"
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
