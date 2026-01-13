
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
      return; 
    }

    if (limitReached) {
      alert(`Daily limit reached for ${plan.name} plan! Upgrade for more.`);
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
    <div className="min-h-screen bg-[#050505] pb-40 flex flex-col items-center">
      
      {/* Dynamic Spotify-Style Now Playing Header */}
      <div className="w-full sticky top-0 z-40 overflow-hidden bg-black/40 backdrop-blur-3xl border-b border-white/10">
        {activeTrack ? (
          <div className="relative w-full py-8 px-6 md:px-12 animate-in slide-in-from-top duration-500">
            {/* Background Blur */}
            <div className="absolute inset-0 -z-10 opacity-20 blur-3xl scale-150 transform">
              <img src={activeTrack.albumArt} className="w-full h-full object-cover" alt="" />
            </div>
            
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
                <img src={activeTrack.albumArt} className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`} alt="Art" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#050505] rounded-full border border-white/20"></div>
                </div>
              </div>

              <div className="flex-grow text-center md:text-left space-y-4">
                <div>
                   <span className="text-[10px] font-black bg-green-500 text-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">Now Streaming</span>
                   <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none truncate max-w-2xl">{activeTrack.title}</h2>
                   <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-sm mt-2">{activeTrack.artist}</p>
                </div>

                <div className="space-y-2 max-w-xl">
                   <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <span className="text-green-500">{formatTime(currentTime)}</span>
                      <span>{formatTime(activeTrack.duration)}</span>
                   </div>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-300 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${(currentTime / activeTrack.duration) * 100}%` }}></div>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button onClick={() => isPlaying ? pauseTrack() : startTrack()} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl">
                           <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} ${isPlaying ? '' : 'ml-1'}`}></i>
                        </button>
                        <p className="text-green-500 font-black text-xs uppercase italic">Yielding: ${activeTrack.earningUSD.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">Limit Remaining</p>
                         <p className="text-xs font-black text-white">{remainingSongs} plays</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 px-6">
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
        )}
      </div>

      <div className="w-full max-w-4xl px-6 pt-12 space-y-8">
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
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-14 pr-6 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/10 transition-all font-bold text-sm shadow-2xl"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['All', ...SONG_CATEGORIES].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat ? 'bg-white text-black shadow-lg scale-105' : 'bg-white/5 text-gray-500 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Track List */}
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
              const ngnVal = (track.earningUSD * settings.usdToNgnRate).toLocaleString();

              return (
                <div 
                  key={track.id} 
                  onClick={() => !isPlayed && togglePlay(track)}
                  className={`group relative glass-card rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 border ${
                    isActive ? 'border-green-500/40 bg-green-500/10 ring-1 ring-green-500/20' : 'border-white/5 hover:bg-white/5'
                  } ${isPlayed ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
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
                  </div>

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
              <span className="text-gray-600 text-[10px]">Your daily wallet has been successfully updated.</span>
            </p>
            <button 
              onClick={() => setShowRewardModal(null)}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-green-500 transition-all uppercase tracking-widest shadow-xl active:scale-95"
            >
              Back To Vault
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListenEarn;
