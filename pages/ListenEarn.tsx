
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SONG_CATEGORIES, PLAN_DETAILS } from '../constants';
import { MusicTrack, AppSettings, User, PlanTier } from '../types';

interface ListenEarnProps {
  onReward: (amount: number, trackId: string) => void;
  settings: AppSettings;
  user: User;
  tracks: MusicTrack[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Spotify': 'text-green-500',
  'Boomplay': 'text-blue-500',
  'Audiomack': 'text-orange-500',
  'Apple Music': 'text-red-500'
};

const ListenEarn: React.FC<ListenEarnProps> = ({ onReward, settings, user, tracks }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'All');
  const [showRewardModal, setShowRewardModal] = useState<{ amount: number } | null>(null);
  const [timeToReset, setTimeToReset] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeRef = useRef(0);

  const plan = PLAN_DETAILS[user.plan];
  const limitReached = user.songsListenedToday >= plan.songLimit;
  
  const activeTrack = tracks.find(t => t.id === activeTrackId);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeToReset(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const togglePlay = (track: MusicTrack) => {
    if (user.playedTracksToday.includes(track.id)) { alert("ROYALTY SYNC: Already collected for this asset."); return; }
    if (limitReached) { alert("NODE LIMIT: Upgrade to increase asset capacity."); return; }

    if (activeTrackId === track.id) {
      if (isPlaying) { setIsPlaying(false); audioRef.current?.pause(); }
      else { setIsPlaying(true); audioRef.current?.play(); }
    } else {
      setActiveTrackId(track.id);
      setCurrentTime(0);
      lastTimeRef.current = 0;
      setIsPlaying(true);
      if (audioRef.current) { audioRef.current.src = track.url; audioRef.current.play(); }
    }
  };

  const filteredTracks = tracks.filter(t => 
    t.enabled && (t.category === activeCategory || activeCategory === 'All') &&
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const progress = activeTrack ? (currentTime / activeTrack.duration) * 100 : 0;

  return (
    <div className="flex-grow pb-40 flex flex-col items-center">
      
      {/* Dynamic Player Board */}
      {activeTrack && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-[80] bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                <i className={`fas fa-headphones ${CATEGORY_COLORS[activeTrack.category] || 'text-green-500'} text-2xl animate-pulse`}></i>
             </div>
             <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-[8px] font-black uppercase text-green-500 tracking-[0.2em]">{activeTrack.category} NODE ACTIVE</span>
                </div>
                <h2 className="text-white font-black text-xs uppercase italic truncate leading-none">{activeTrack.title}</h2>
                <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
                   <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${Math.min(100, progress)}%` }}></div>
                </div>
             </div>
             <button onClick={() => togglePlay(activeTrack)} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shrink-0 shadow-lg active:scale-90 transition-all">
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-sm`}></i>
             </button>
          </div>
        </div>
      )}

      <div className={`w-full max-w-md p-6 transition-all ${activeTrack ? 'pt-44' : 'pt-6'}`}>
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all"
            >
              <i className="fas fa-chevron-left text-sm"></i>
            </button>
            <div className="text-right">
              <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Protocol Reset</p>
              <p className="text-xs font-black italic text-green-500">{timeToReset}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
               <i className="fas fa-bolt text-black text-sm"></i>
            </div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Audio Vault</h1>
          </div>

          <div className="relative">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 text-xs"></i>
            <input type="text" placeholder="Search earnable assets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm font-bold focus:border-green-500 transition-all shadow-xl outline-none" />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['All', ...SONG_CATEGORIES].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`px-5 py-3 rounded-xl whitespace-nowrap text-[9px] font-black uppercase tracking-widest border transition-all ${
                  activeCategory === cat 
                  ? 'bg-white text-black border-transparent shadow-xl' 
                  : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredTracks.length === 0 ? (
               <div className="text-center py-20 opacity-20 italic uppercase font-black text-[10px] tracking-widest">No matching assets found</div>
            ) : filteredTracks.map(track => {
               const isPlayed = user.playedTracksToday.includes(track.id);
               return (
                <div 
                  key={track.id} 
                  onClick={() => !isPlayed && togglePlay(track)} 
                  className={`glass-card p-4 rounded-3xl border flex items-center gap-4 transition-all ${
                    activeTrackId === track.id ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/10' : 'border-white/5'
                  } ${isPlayed ? 'opacity-30 grayscale' : 'cursor-pointer hover:bg-white/5 android-touch'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                      <i className={`fas fa-headphones ${CATEGORY_COLORS[track.category] || 'text-green-500'} text-2xl`}></i>
                    </div>
                    {isPlayed && <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-green-500"><i className="fas fa-check-circle text-xl"></i></div>}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-white font-black text-xs uppercase italic truncate mb-0.5 leading-none">{track.title}</h3>
                    <p className="text-[9px] text-gray-600 font-bold uppercase truncate italic mb-2">{track.artist}</p>
                    <div className="flex items-center gap-3">
                       <span className="text-green-500 text-[10px] font-black tracking-tight">+${track.earningUSD.toFixed(2)}</span>
                       <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest">{track.duration}s sync</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center ${activeTrackId === track.id && isPlaying ? 'bg-green-500 text-black border-transparent shadow-lg' : 'text-gray-600'}`}>
                     <i className={`fas ${activeTrackId === track.id && isPlaying ? 'fa-volume-up animate-bounce' : 'fa-play'} text-[9px]`}></i>
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      </div>
      
      <audio ref={audioRef} onTimeUpdate={() => { if(audioRef.current) setCurrentTime(audioRef.current.currentTime); }} onEnded={() => { setIsPlaying(false); if(activeTrackId) { const t = tracks.find(t=>t.id===activeTrackId)!; onReward(t.earningUSD, activeTrackId); setShowRewardModal({amount: t.earningUSD}); setActiveTrackId(null); } }} />
      
      {showRewardModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
           <div className="glass-card max-w-sm w-full p-10 rounded-[3rem] text-center border border-green-500/30 pop-notification">
              <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border-2 border-black rotate-2 shadow-green-500/20">
                 <i className="fas fa-coins text-black text-3xl"></i>
              </div>
              <h2 className="text-2xl font-black uppercase italic mb-2 tracking-tighter text-white">YIELD SYNCED</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase mb-10 tracking-[0.2em] leading-relaxed">Balance updated with <span className="text-green-500">+${showRewardModal.amount.toFixed(2)}</span> royalties.</p>
              <button onClick={() => setShowRewardModal(null)} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 transition-all">Verify Wallet</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ListenEarn;
