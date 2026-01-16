
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SONG_CATEGORIES, PLAN_DETAILS, BOOMPLAY_PNG, AUDIOMACK_PNG, SPOTIFY_PNG } from '../constants';
import { MusicTrack, AppSettings, User, PlanTier } from '../types';

interface ListenEarnProps {
  onReward: (amount: number, trackId: string) => void;
  settings: AppSettings;
  user: User;
  tracks: MusicTrack[];
}

const CATEGORY_ICONS: Record<string, string> = {
  'Spotify': SPOTIFY_PNG,
  'Boomplay': BOOMPLAY_PNG,
  'Audiomack': AUDIOMACK_PNG,
  'All': 'fas fa-globe'
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
    if (user.playedTracksToday.includes(track.id)) { alert("Already claimed."); return; }
    if (limitReached) { alert("Daily limit reached."); return; }

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
    <div className="min-h-screen pb-40 flex flex-col items-center">
      
      {/* Spotify Playing Board Overlay */}
      {activeTrack && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-[80] bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
             <img src={activeTrack.albumArt} className="w-14 h-14 rounded-2xl object-cover animate-pulse" alt="" />
             <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <img src={CATEGORY_ICONS[activeTrack.category] || SPOTIFY_PNG} className="w-3.5 h-3.5 object-contain" alt="" />
                   <span className="text-[9px] font-black uppercase text-green-500 tracking-[0.2em]">{activeTrack.category} PLATFORM</span>
                </div>
                <h2 className="text-white font-black text-sm uppercase italic truncate">{activeTrack.title}</h2>
                <div className="w-full bg-white/5 h-1 rounded-full mt-3 overflow-hidden">
                   <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${Math.min(100, progress)}%` }}></div>
                </div>
             </div>
             <button onClick={() => togglePlay(activeTrack)} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shrink-0 shadow-lg active:scale-90 transition-all">
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
             </button>
          </div>
        </div>
      )}

      <div className={`w-full p-6 transition-all ${activeTrack ? 'pt-40' : 'pt-6'}`}>
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/10 active:scale-90 transition-all"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <div className="text-right">
              <p className="text-[9px] text-gray-500 font-black uppercase">Next Liquidity Reset</p>
              <p className="text-sm font-black italic text-green-500">{timeToReset}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
               <i className="fas fa-music text-black"></i>
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Music Inventory</h1>
          </div>

          <div className="relative">
            <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-600"></i>
            <input type="text" placeholder="Search artist or title..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-5 pl-14 pr-6 text-white font-bold focus:border-green-500 transition-all shadow-xl" />
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
            {['All', ...SONG_CATEGORIES].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`px-8 py-4 rounded-2xl whitespace-nowrap text-[11px] font-black uppercase tracking-widest border transition-all ${
                  activeCategory === cat 
                  ? 'bg-white text-black border-transparent shadow-xl scale-105' 
                  : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTracks.map(track => {
               const isPlayed = user.playedTracksToday.includes(track.id);
               return (
                <div 
                  key={track.id} 
                  onClick={() => !isPlayed && togglePlay(track)} 
                  className={`glass-card p-5 rounded-[2.5rem] border flex items-center gap-5 transition-all ${
                    activeTrackId === track.id ? 'border-green-500 bg-green-500/10' : 'border-white/5'
                  } ${isPlayed ? 'opacity-40' : 'cursor-pointer hover:bg-white/5 active:scale-[0.98]'}`}
                >
                  <div className="relative">
                    <img src={track.albumArt} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-2xl" alt="" />
                    {isPlayed && <div className="absolute inset-0 bg-black/60 rounded-[1.5rem] flex items-center justify-center text-green-500"><i className="fas fa-check-circle text-2xl"></i></div>}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-white font-black text-sm uppercase italic truncate">{track.title}</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate mb-2">{track.artist}</p>
                    <div className="flex items-center gap-2">
                       <img src={CATEGORY_ICONS[track.category] || SPOTIFY_PNG} className="w-4 h-4 object-contain" alt="" />
                       <p className="text-green-500 text-[11px] font-black tracking-tight">+${track.earningUSD.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full border border-white/10 flex items-center justify-center ${activeTrackId === track.id && isPlaying ? 'bg-green-500 text-black border-transparent shadow-lg shadow-green-500/30' : 'text-gray-500'}`}>
                     <i className={`fas ${activeTrackId === track.id && isPlaying ? 'fa-volume-up animate-bounce' : 'fa-play'} text-xs`}></i>
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
           <div className="glass-card max-w-sm w-full p-10 rounded-[3rem] text-center border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.15)]">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl border-4 border-black">
                 <i className="fas fa-wallet text-black text-4xl"></i>
              </div>
              <h2 className="text-4xl font-black uppercase italic mb-2 tracking-tighter text-white">Royalty Paid!</h2>
              <p className="text-sm text-gray-500 font-bold uppercase mb-12 tracking-[0.2em] leading-relaxed">System balance updated by <span className="text-green-500">+${showRewardModal.amount.toFixed(2)}</span></p>
              <button onClick={() => setShowRewardModal(null)} className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-green-500 transition-all active:scale-95">Collect & Sync</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ListenEarn;
