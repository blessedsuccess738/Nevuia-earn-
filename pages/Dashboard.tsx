
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, AppSettings, Transaction, PublicChatMessage, PlanTier } from '../types';
import { BOOMPLAY_PNG, AUDIOMACK_PNG, SPOTIFY_PNG } from '../constants';

interface DashboardProps {
  user: User;
  settings: AppSettings;
  transactions: Transaction[];
  onClaimDaily: () => void;
  onSendMessage: (text: string, isAdmin?: boolean) => void;
  onSendPublicMessage: (text: string) => void;
  onClearNotifications: () => void;
  messages: any[];
  publicChat: PublicChatMessage[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, settings, onSendPublicMessage, publicChat 
}) => {
  const navigate = useNavigate();
  const [chatMsg, setChatMsg] = useState('');
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [onlineUsers] = useState(Math.floor(Math.random() * 50) + 168);

  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [publicChat, showChat]);

  const handleCopyRef = () => {
    const link = `${window.location.origin}/#/signup?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied to clipboard!');
  };

  const platforms = [
    { name: 'Spotify', icon: 'fab fa-spotify', color: 'text-[#1DB954]', img: SPOTIFY_PNG, cat: 'Spotify' },
    { name: 'Boomplay', icon: 'fas fa-play', color: 'text-[#00C2FF]', img: BOOMPLAY_PNG, cat: 'Boomplay' },
    { name: 'Audiomack', icon: 'fas fa-wave-square', color: 'text-[#FFA200]', img: AUDIOMACK_PNG, cat: 'Audiomack' },
    { name: 'Apple Music', icon: 'fab fa-apple', color: 'text-[#FC3C44]', img: null, cat: 'Apple Music' }
  ];

  return (
    <div className="min-h-screen pb-32 px-4 pt-6 max-w-lg mx-auto space-y-6">
      
      {/* Breaking News Ticker */}
      <div className="bg-red-600/10 border border-red-600/30 rounded-2xl p-3 flex items-center gap-3 overflow-hidden shadow-lg">
         <div className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded uppercase animate-pulse shrink-0">News</div>
         <marquee className="text-white text-[11px] font-bold uppercase tracking-wider italic">
            {settings.announcementSubject}: {settings.announcementContent} — PAYOUTS ARE CURRENTLY {settings.isWithdrawalOpen ? 'OPEN' : 'CLOSED'} — REFER PARTNERS TO EARN INSTANT REWARDS — 
         </marquee>
      </div>

      {/* Hero Profile Card */}
      <div className="glass-card p-8 rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl bg-gradient-to-br from-green-500/10 to-transparent">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <i className="fas fa-crown text-6xl rotate-12"></i>
        </div>
        <div className="relative z-10 flex items-center gap-5 mb-6">
           <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-green-500 border border-white/10 shadow-inner">
              <i className="fas fa-user-shield text-2xl"></i>
           </div>
           <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-1">{user.username}</h1>
              <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-2 py-1 rounded-lg ${user.plan === PlanTier.PREMIUM ? 'bg-yellow-500 text-black' : 'bg-green-500/20 text-green-500'}`}>
                {user.plan} ID
              </span>
           </div>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-4">
           <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Available USD</p>
              <h2 className="text-4xl font-black text-white tracking-tighter">${user.balanceUSD.toFixed(2)}</h2>
           </div>
           <div className="text-right">
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Local NGN</p>
              <h2 className="text-xl font-black text-green-500 tracking-tighter">₦{(user.balanceUSD * settings.usdToNgnRate).toLocaleString()}</h2>
           </div>
        </div>
      </div>

      {/* Navigation Nodes (Moved into body as requested) */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => navigate('/listen')} className="glass-card border border-white/10 py-6 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-white/5">
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 text-xl">
            <i className="fas fa-headphones"></i>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Earn Now</span>
        </button>
        <button onClick={() => navigate('/activation')} className="glass-card border border-white/10 py-6 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-white/5">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 text-xl">
            <i className="fas fa-bolt"></i>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Upgrade</span>
        </button>
        <button onClick={() => navigate('/withdraw')} className="glass-card border border-white/10 py-6 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-white/5">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 text-xl">
            <i className="fas fa-wallet"></i>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Payout</span>
        </button>
      </div>

      {/* Global Chat Button */}
      <button 
        onClick={() => setShowChat(true)}
        className="w-full bg-blue-600 p-5 rounded-[2rem] flex items-center justify-between shadow-2xl active:scale-95 transition-all group"
      >
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
              <i className="fas fa-comments text-xl"></i>
           </div>
           <div className="text-left">
              <h3 className="text-white font-black uppercase italic tracking-tighter">Community Lounge</h3>
              <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">{onlineUsers} Earner Nodes Active</p>
           </div>
        </div>
        <i className="fas fa-chevron-right text-white/50 group-hover:text-white transition-all"></i>
      </button>

      {/* Platform Grid */}
      <div className="space-y-4">
         <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] ml-2">Verified Platforms</h3>
         <div className="grid grid-cols-2 gap-4">
            {platforms.map(p => (
              <button 
                key={p.name}
                onClick={() => navigate(`/listen?cat=${p.cat}`)}
                className="glass-card p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-4 hover:bg-white/5 transition-all active:scale-95 shadow-lg"
              >
                {p.img ? (
                  <img src={p.img} className="w-10 h-10 object-contain" alt="" />
                ) : (
                  <i className={`${p.icon} ${p.color} text-4xl`}></i>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{p.name}</span>
              </button>
            ))}
         </div>
      </div>

      {/* Referral Link Node */}
      <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 flex items-center justify-between bg-black/40">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
               <i className="fas fa-link"></i>
            </div>
            <div>
               <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Affiliate Node</p>
               <h4 className="text-white font-black text-sm uppercase italic tracking-tighter">{user.referralCode}</h4>
            </div>
         </div>
         <button onClick={handleCopyRef} className="bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all">Copy</button>
      </div>

      {/* Chat Room Overlay */}
      {showChat && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 flex flex-col">
          <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                  <i className="fas fa-earth-africa text-xl"></i>
               </div>
               <div>
                  <h3 className="text-white font-black uppercase italic tracking-tight">Global Channel</h3>
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">{onlineUsers} Online</p>
               </div>
            </div>
            <button onClick={() => setShowChat(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all">
               <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto no-scrollbar p-6 space-y-6">
            {publicChat.map(m => (
              <div key={m.id} className="animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-1">
                   <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${m.tier === PlanTier.PREMIUM ? 'bg-yellow-500 text-black font-black' : 'bg-white/10 text-gray-500'}`}>{m.tier}</span>
                   <span className="text-[10px] font-black text-white italic">@{m.username}</span>
                </div>
                <div className="bg-white/5 p-5 rounded-[2rem] rounded-tl-none border border-white/5 text-[12px] text-gray-300 font-medium">
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-8 bg-black/80 border-t border-white/10">
            <form onSubmit={(e) => { e.preventDefault(); if(chatMsg.trim()){ onSendPublicMessage(chatMsg); setChatMsg(''); } }} className="flex gap-3">
              <input type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)} className="flex-grow bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4 text-white text-xs font-bold outline-none focus:border-blue-500" placeholder="Broadcast message..." />
              <button type="submit" className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
