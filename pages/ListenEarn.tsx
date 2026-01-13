
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SONG_CATEGORIES, PLAN_DETAILS } from '../constants';
import { MusicTrack, AppSettings, User, PlanTier } from '../types';

interface ListenEarnProps {
  onReward: (amount: number, trackId: string) => void;
  settings: AppSettings;
  user: User;
  tracks: MusicTrack[];
}

const ListenEarn: React.FC<ListenEarnProps> = ({ onReward, settings, user, tracks }) => {
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [showRewardModal, setShowRewardModal] = useState<{ amount: number } | null>(null);
  const [timeToReset, setTimeToReset] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeRef = useRef(0);

  const plan = PLAN_DETAILS[user.plan];
  const limitReached = user.songsListenedToday >= plan.songLimit;
  const remainingSongs = plan.songLimit === Infinity ? 'Unlimited' : Math.max(0, plan.songLimit - user.songsListenedToday);

  // Daily Reset Countdown Logic
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

  // Anti-Cheat: Prevent background playback and tab switching if needed
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        pauseTrack();
        alert("Playback paused. You must stay on the page to earn.");
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  const startTrack = useCallback(() => {
    setIsPlaying(true);
    audioRef.current?.play();
  }, []);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    audioRef.current?.pause();
  }, []);

  const togglePlay = (track: MusicTrack) => {
    if (user.playedTracksToday.includes(track.id)) {
      return; // Already locked
    }

    if (limitReached) {
      alert(`Daily limit of ${plan.songLimit} songs reached for your ${plan.name} plan! Upgrade for more.`);
      return;
    }

    if (activeTrackId === track.id) {
      if (isPlaying) pauseTrack();
      else startTrack();
    } else {
      setActiveTrackId(track.id);
      setCurrentTime(0);
      lastTimeRef.current = 0;
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      // Anti-Cheat: Detect seeking (jumping ahead)
      if (current > lastTimeRef.current + 2) {
        audioRef.current.currentTime = lastTimeRef.current;
        alert("Seeking is disabled. Listen to the full track to earn.");
      } else {
        lastTimeRef.current = current;
        setCurrentTime(current);
      }
    }
  };

  const handleSongEnd = () => {
    setIsPlaying(false);
    if (activeTrackId) {
      const track = tracks.find(t => t.id === activeTrackId);
      if (track) {
        onReward(track.earningUSD, track.id);
        setShowRewardModal({ amount: track.earningUSD });
      }
      setActiveTrackId(null);
    }
  };

  const filteredTracks = tracks.filter(t => 
    t.enabled &&
    (t.category === activeCategory || activeCategory === 'All') &&
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     t.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-32 flex flex-col items-center">
      {/* Top Header Panel */}
      <div className="w-full sticky top-0 z-40 bg-black/60 backdrop-blur-2xl border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
               <i className="fas fa-headphones text-black text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter italic uppercase leading-none">Music Vault</h1>
              <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em] mt-1">{plan.name} • {remainingSongs} Plays Left</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
            <div className="text-right">
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">Next Reset In</p>
              <p className="text-sm font-black text-white italic">{timeToReset}</p>
            </div>
            <i className="fas fa-history text-gray-600"></i>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl px-6 pt-8 space-y-8">
        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-600 group-focus-within:text-green-500 transition-colors"></i>
          </div>
          <input 
            type="text" 
            placeholder="Search artists, tracks, genres..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-14 pr-6 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/10 transition-all font-bold text-sm"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['All', ...SONG_CATEGORIES].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat ? 'bg-white text-black shadow-lg scale-105' : 'bg-white/5 text-gray-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Boomplay Style List */}
        <div className="space-y-3 pb-20">
          {filteredTracks.length === 0 ? (
            <div className="text-center py-24 glass-card rounded-[3rem] border border-dashed border-white/10 opacity-30">
               <i className="fas fa-music text-4xl mb-4 block"></i>
               <p className="text-[10px] font-black uppercase tracking-widest">No matching tracks found.</p>
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isActive = activeTrackId === track.id;
              const isPlayed = user.playedTracksToday.includes(track.id);
              const trackProgress = isActive ? (currentTime / track.duration) * 100 : 0;
              const ngnVal = (track.earningUSD * settings.usdToNgnRate).toLocaleString();

              return (
                <div 
                  key={track.id} 
                  onClick={() => !isPlayed && togglePlay(track)}
                  className={`group relative glass-card rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 border ${
                    isActive ? 'border-green-500/40 bg-green-500/5 ring-1 ring-green-500/20' : 'border-white/5 hover:bg-white/5'
                  } ${isPlayed ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {/* Album Art */}
                  <div className="relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-2xl">
                    <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    {isActive && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex gap-1 items-end h-6">
                           {[1,2,3,4].map(i => (
                             <div key={i} className="w-1 bg-green-500 rounded-full animate-bounce" style={{ height: `${Math.random()*100}%`, animationDelay: `${i*0.1}s` }}></div>
                           ))}
                        </div>
                      </div>
                    )}
                    {isPlayed && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <i className="fas fa-lock text-white/50 text-xl"></i>
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-white font-black text-sm md:text-base truncate uppercase tracking-tighter italic">{track.title}</h3>
                      {isPlayed && <span className="text-[8px] font-black bg-white/10 text-gray-400 px-1.5 py-0.5 rounded uppercase leading-none">Played</span>}
                    </div>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest truncate">{track.artist}</p>
                    
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-green-500 font-black text-[10px] leading-none">${track.earningUSD.toFixed(2)} / ₦{ngnVal}</span>
                       <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                       <span className="text-gray-600 font-black text-[9px] leading-none uppercase">{formatTime(track.duration)}</span>
                    </div>

                    {isActive && (
                      <div className="mt-3">
                         <div className="flex justify-between items-center mb-1 text-[8px] font-black uppercase text-green-500 tracking-widest">
                            <span>{formatTime(currentTime)}</span>
                            <span>-{formatTime(track.duration - currentTime)}</span>
                         </div>
                         <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${trackProgress}%` }}></div>
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Play Button Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all ${
                    isActive ? 'bg-green-500 text-black border-transparent scale-110 shadow-lg' : 'text-gray-500 group-hover:text-white group-hover:border-white/30'
                  }`}>
                    {isPlayed ? (
                      <i className="fas fa-check text-xs"></i>
                    ) : (
                      <i className={`fas ${isActive && isPlaying ? 'fa-pause' : 'fa-play'} text-xs ${isActive ? '' : 'ml-1'}`}></i>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        controlsList="nodownload noplaybackrate"
      />

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="glass-card max-w-sm w-full p-10 rounded-[3rem] border border-green-500/20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
               <i className="fas fa-coins text-black text-3xl"></i>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Gold Credited!</h2>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-10 leading-relaxed">
              You earned +${showRewardModal.amount.toFixed(2)} (₦{(showRewardModal.amount * settings.usdToNgnRate).toFixed(0)}) <br />
              <span className="text-gray-600 text-[10px]">Come back tomorrow for more earnings from this track.</span>
            </p>
            <button 
              onClick={() => setShowRewardModal(null)}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-green-500 transition-all uppercase tracking-widest shadow-xl active:scale-95"
            >
              Continue Earning
            </button>
          </div>
        </div>
      )}

      {/* Persistent Mini Player Control if needed */}
      {activeTrackId && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-50 animate-in slide-in-from-bottom-10 duration-500">
           <div className="glass-card p-4 rounded-[2rem] border border-green-500/20 shadow-2xl flex items-center gap-4">
              <img 
                src={tracks.find(t => t.id === activeTrackId)?.albumArt} 
                className="w-12 h-12 rounded-xl object-cover" 
                alt="Mini Cover" 
              />
              <div className="flex-grow min-w-0">
                 <p className="text-white font-black text-xs uppercase italic truncate">
                   {tracks.find(t => t.id === activeTrackId)?.title}
                 </p>
                 <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${(currentTime / (tracks.find(t => t.id === activeTrackId)?.duration || 1)) * 100}%` }}></div>
                 </div>
              </div>
              <button 
                onClick={() => isPlaying ? pauseTrack() : startTrack()}
                className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg"
              >
                 <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-xs`}></i>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ListenEarn;
