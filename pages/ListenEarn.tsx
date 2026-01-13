
import React, { useState, useEffect, useRef } from 'react';
import { SONG_CATEGORIES, PLAN_DETAILS } from '../constants';
import { MusicTrack, AppSettings, User, PlanTier } from '../types';

interface ListenEarnProps {
  onReward: (amount: number) => void;
  settings: AppSettings;
  user: User;
  tracks: MusicTrack[];
}

const ListenEarn: React.FC<ListenEarnProps> = ({ onReward, settings, user, tracks }) => {
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [completedTracks, setCompletedTracks] = useState<Set<string>>(new Set());
  const [showRewardModal, setShowRewardModal] = useState<{ amount: number } | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const plan = PLAN_DETAILS[user.plan];
  const limitReached = user.songsListenedToday >= plan.songLimit;
  const remainingSongs = plan.songLimit === Infinity ? 'Unlimited' : Math.max(0, plan.songLimit - user.songsListenedToday);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        pauseTrack();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isPlaying && timeLeft === 0) {
      handleSongEnd();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft]);

  const togglePlay = (track: MusicTrack) => {
    if (limitReached) {
      alert(`Daily limit of ${plan.songLimit} songs reached for your ${plan.name} plan! Upgrade for more.`);
      return;
    }

    if (completedTracks.has(track.id)) {
      alert("You have already earned from this song. Choose another one.");
      return;
    }

    if (activeTrackId === track.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        startTrack();
      }
    } else {
      setActiveTrackId(track.id);
      setTimeLeft(track.duration);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      }
    }
  };

  const startTrack = () => {
    setIsPlaying(true);
    audioRef.current?.play();
  };

  const pauseTrack = () => {
    setIsPlaying(false);
    audioRef.current?.pause();
  };

  const handleSongEnd = () => {
    setIsPlaying(false);
    audioRef.current?.pause();
    
    if (activeTrackId) {
      const track = tracks.find(t => t.id === activeTrackId);
      if (track) {
        setCompletedTracks(prev => new Set(prev).add(activeTrackId));
        onReward(track.earningUSD);
        setShowRewardModal({ amount: track.earningUSD });
      }
      setActiveTrackId(null);
    }
  };

  const filteredTracks = tracks.filter(t => 
    (t.category === activeCategory) &&
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     t.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-32">
      <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter italic uppercase">Listen & Earn</h1>
            <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em]">{plan.name} Plan Active</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-right mb-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase block leading-none">Limit Today</span>
              <span className="text-lg font-black text-white">{remainingSongs} <span className="text-gray-500 text-xs">Remaining</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-green-500/5 blur-xl group-focus-within:bg-green-500/10 transition-all rounded-3xl"></div>
          <input 
            type="text" 
            placeholder="Search tracks or artists..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-all font-medium"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {SONG_CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-black transition-all ${
                activeCategory === cat ? 'bg-green-500 text-black shadow-lg scale-105' : 'bg-white/5 text-gray-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTracks.length === 0 ? (
            <div className="md:col-span-2 text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-gray-500 font-bold uppercase tracking-widest">No songs in this category yet.</p>
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isActive = activeTrackId === track.id;
              const isDone = completedTracks.has(track.id);
              const progress = isActive ? ((track.duration - timeLeft) / track.duration) * 100 : 0;
              const ngnEarning = (track.earningUSD * settings.usdToNgnRate).toFixed(0);

              return (
                <div 
                  key={track.id} 
                  onClick={() => !isDone && togglePlay(track)}
                  className={`group relative overflow-hidden glass-card rounded-3xl p-4 flex flex-col transition-all cursor-pointer border ${
                    isActive ? 'border-green-500/40 bg-green-500/5 ring-1 ring-green-500/20' : 'border-white/5 hover:bg-white/5'
                  } ${isDone || limitReached ? 'opacity-40 grayscale' : ''}`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <img 
                      src={track.albumArt} 
                      alt={track.title}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-2xl transition-all group-hover:scale-105`}
                    />

                    <div className="flex-grow min-w-0">
                      <h3 className="text-white font-black text-base truncate tracking-tight">{track.title}</h3>
                      <p className="text-gray-500 text-xs truncate font-bold mb-2">{track.artist}</p>
                      
                      <div className="flex items-center gap-2">
                         <div className="bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-lg">
                            <span className="text-[10px] text-green-500 font-black uppercase tracking-tighter">${track.earningUSD.toFixed(2)} → ₦{ngnEarning}</span>
                         </div>
                         <span className="text-gray-600 text-[9px] font-black uppercase tracking-widest">{formatTime(track.duration)}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive ? 'bg-green-500 text-black' : 'bg-white/5 text-white'
                      }`}>
                        <i className={`fas ${isActive && isPlaying ? 'fa-pause' : 'fa-play'} text-xs ml-0.5`}></i>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-green-500 uppercase animate-pulse">Engaging Earner...</span>
                        <span className="text-[10px] font-black text-white">{timeLeft}s left</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-1000" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <audio ref={audioRef} onEnded={handleSongEnd} />

      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-2xl">
          <div className="glass-card max-w-sm w-full p-12 rounded-[3rem] border border-green-500/20 text-center relative">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
               <i className="fas fa-check text-black text-3xl"></i>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Earnings Credited!</h2>
            <p className="text-gray-400 mb-8 font-medium">You earned +${showRewardModal.amount.toFixed(2)} (₦{(showRewardModal.amount * settings.usdToNgnRate).toFixed(0)})</p>
            <button 
              onClick={() => setShowRewardModal(null)}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-green-500 hover:text-black transition-all uppercase tracking-widest"
            >
              Continue Listening
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListenEarn;
