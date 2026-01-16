
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, PlanTier } from '../types';

interface SettingsProps {
  user: User;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-grow pb-32 px-5 pt-4 w-full space-y-6 page-enter">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all shadow-lg"
        >
          <i className="fas fa-chevron-left text-sm"></i>
        </button>
        <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">System Config</h1>
      </div>

      <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
        <div className="flex flex-col items-center gap-3 border-b border-white/5 pb-6">
           <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center text-black text-3xl shadow-lg rotate-2">
              <i className="fas fa-headphones"></i>
           </div>
           <div className="text-center">
              <h2 className="text-white font-black uppercase italic text-lg">{user.username}</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.email}</p>
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] ml-1">Node Status</h3>
           <div className="grid grid-cols-1 gap-3">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center shadow-inner">
                 <span className="text-[11px] font-black text-gray-500 uppercase">Operational</span>
                 <span className="text-[11px] font-black text-green-500 uppercase italic">Active</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center shadow-inner">
                 <span className="text-[11px] font-black text-gray-500 uppercase">Tier Protocol</span>
                 <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${user.plan === PlanTier.PREMIUM ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-green-500/20 text-green-500'}`}>
                    {user.plan}
                 </span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center shadow-inner">
                 <span className="text-[11px] font-black text-gray-500 uppercase">Linked Since</span>
                 <span className="text-[11px] font-black text-white uppercase">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
           </div>
        </div>

        <div className="space-y-3 pt-4">
           <h3 className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] ml-1">Ecosystem Controls</h3>
           <button onClick={() => window.open('https://wa.me/yournumber', '_blank')} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 flex items-center justify-between group transition-all android-touch">
              <div className="flex items-center gap-3">
                 <i className="fab fa-whatsapp text-gray-500 group-hover:text-green-500 text-xs"></i>
                 <span className="text-[11px] font-black text-white uppercase">Direct Support</span>
              </div>
              <i className="fas fa-chevron-right text-[10px] text-gray-800"></i>
           </button>
           <button onClick={onLogout} className="w-full p-4 bg-red-600/10 hover:bg-red-600/20 rounded-2xl border border-red-600/20 flex items-center justify-between group transition-all android-touch">
              <div className="flex items-center gap-3">
                 <i className="fas fa-power-off text-red-500 text-xs"></i>
                 <span className="text-[11px] font-black text-red-500 uppercase">Disconnect Session</span>
              </div>
              <i className="fas fa-chevron-right text-[10px] text-red-900"></i>
           </button>
        </div>
      </div>
      
      <p className="text-center text-[8px] text-gray-800 font-black uppercase tracking-[0.5em] pb-10 neon-glow">BeatBucks OS v3.8.4 • Verified Listener Registry</p>
    </div>
  );
};

export default Settings;
