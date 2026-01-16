
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, PlanTier } from '../types';

interface SettingsProps {
  user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-grow pb-32 px-4 pt-6 max-w-md mx-auto w-full space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
        >
          <i className="fas fa-chevron-left text-sm"></i>
        </button>
        <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">User Settings</h1>
      </div>

      <div className="glass-card p-6 rounded-[2rem] border border-white/10 space-y-6">
        <div className="flex flex-col items-center gap-3 border-b border-white/5 pb-6">
           <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center text-black text-3xl shadow-lg">
              <i className="fas fa-user-astronaut"></i>
           </div>
           <div className="text-center">
              <h2 className="text-white font-black uppercase italic text-lg">{user.username}</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.email}</p>
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] ml-1">Account Protocol</h3>
           <div className="grid grid-cols-1 gap-3">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                 <span className="text-[11px] font-black text-gray-400 uppercase">Account Status</span>
                 <span className="text-[11px] font-black text-green-500 uppercase italic">{user.status}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                 <span className="text-[11px] font-black text-gray-400 uppercase">Tier Level</span>
                 <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded ${user.plan === PlanTier.PREMIUM ? 'bg-yellow-500 text-black' : 'bg-green-500/20 text-green-500'}`}>
                    {user.plan}
                 </span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                 <span className="text-[11px] font-black text-gray-400 uppercase">Member Since</span>
                 <span className="text-[11px] font-black text-white uppercase">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
           </div>
        </div>

        <div className="space-y-4 pt-4">
           <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] ml-1">Privacy & Security</h3>
           <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 flex items-center justify-between group transition-all">
              <div className="flex items-center gap-3">
                 <i className="fas fa-lock text-gray-500 group-hover:text-green-500 text-xs"></i>
                 <span className="text-[11px] font-black text-white uppercase">Change Password</span>
              </div>
              <i className="fas fa-chevron-right text-[10px] text-gray-700"></i>
           </button>
           <button className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 flex items-center justify-between group transition-all">
              <div className="flex items-center gap-3">
                 <i className="fas fa-bell text-gray-500 group-hover:text-green-500 text-xs"></i>
                 <span className="text-[11px] font-black text-white uppercase">App Notifications</span>
              </div>
              <div className="w-8 h-4 bg-green-500 rounded-full relative">
                 <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
              </div>
           </button>
        </div>

        <div className="pt-6">
           <button 
             onClick={() => window.open('https://wa.me/yournumber', '_blank')}
             className="w-full py-4 bg-green-500/10 text-green-500 rounded-2xl border border-green-500/20 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-green-500 hover:text-black transition-all"
           >
              <i className="fab fa-whatsapp"></i>
              Contact Protocol Support
           </button>
        </div>
      </div>
      
      <p className="text-center text-[8px] text-gray-700 font-black uppercase tracking-[0.5em] pb-10">BeatBucks OS v3.2.1 • Android Integrated</p>
    </div>
  );
};

export default Settings;
