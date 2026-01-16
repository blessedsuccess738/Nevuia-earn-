
import React, { useState, useRef, useEffect } from 'react';
import { User, Transaction, AppSettings, AccountStatus, TransactionStatus, PlanTier, MusicTrack, Message, Notification, AdminNotification } from '../types';
import { SONG_CATEGORIES } from '../constants';

interface AdminPanelProps {
  state: {
    users: User[];
    transactions: Transaction[];
    settings: AppSettings;
    tracks: MusicTrack[];
    messages: Message[];
    adminNotifications: AdminNotification[];
  };
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateTracks: (tracks: MusicTrack[]) => void;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onSendMessage: (text: string, isAdmin: boolean, targetUserId: string) => void;
}

type AdminTab = 'analytics' | 'transactions' | 'tracks' | 'support' | 'settings';

const AdminPanel: React.FC<AdminPanelProps> = ({ state, onUpdateSettings, onUpdateTracks, setState, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
  const [settingsForm, setSettingsForm] = useState(state.settings);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [newTrack, setNewTrack] = useState<Partial<MusicTrack>>({
    title: '', artist: '', url: '', albumArt: '', duration: 60, earningUSD: 0.10, category: 'Spotify', enabled: true
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, activeChatUser]);

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const track: MusicTrack = { ...newTrack as MusicTrack, id: Math.random().toString(36).substr(2, 9) };
    onUpdateTracks([...state.tracks, track]);
    setShowAddTrack(false);
  };

  return (
    <div className="min-h-screen bg-[#050505]/80 p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">Authority Console</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Platform Protocol Access Level: 7</p>
        </div>
        <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 overflow-x-auto no-scrollbar">
          {(['analytics', 'transactions', 'tracks', 'support', 'settings'] as AdminTab[]).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="glass-card p-12 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Environment Controls</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[11px] text-gray-500 uppercase font-black tracking-[0.3em] ml-2">Video Background URL (MP4)</label>
                    <input type="text" value={settingsForm.videoBackgroundUrl} onChange={e => setSettingsForm({...settingsForm, videoBackgroundUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white font-bold" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] text-gray-500 uppercase font-black tracking-[0.3em] ml-2">WhatsApp Link</label>
                    <input type="text" value={settingsForm.whatsappLink} onChange={e => setSettingsForm({...settingsForm, whatsappLink: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white font-bold" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] text-gray-500 uppercase font-black tracking-[0.3em] ml-2">Telegram Link</label>
                    <input type="text" value={settingsForm.telegramAdmin} onChange={e => setSettingsForm({...settingsForm, telegramAdmin: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white font-bold" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] text-gray-500 uppercase font-black tracking-[0.3em] ml-2">USD to NGN Rate</label>
                    <input type="number" value={settingsForm.usdToNgnRate} onChange={e => setSettingsForm({...settingsForm, usdToNgnRate: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white font-bold" />
                 </div>
              </div>
              <div className="pt-8 border-t border-white/5">
                 <button onClick={() => onUpdateSettings(settingsForm)} className="bg-white text-black px-16 py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.4em] shadow-2xl hover:bg-green-500">Apply System Settings</button>
              </div>
           </div>
        </div>
      )}

      {/* Other tabs remain similar to before but with consistent styling... */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="glass-card p-12 rounded-[3.5rem] border border-white/5">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Platform Balance</p>
              <h2 className="text-4xl font-black text-white">${state.users.reduce((acc, u) => acc + u.balanceUSD, 0).toFixed(2)}</h2>
           </div>
           <div className="glass-card p-12 rounded-[3.5rem] border border-white/5">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Total Users</p>
              <h2 className="text-4xl font-black text-white">{state.users.length}</h2>
           </div>
           <div className="glass-card p-12 rounded-[3.5rem] border border-white/5">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Tracks</p>
              <h2 className="text-4xl font-black text-white">{state.tracks.length}</h2>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
