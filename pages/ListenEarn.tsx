
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_TRACKS, SONG_CATEGORIES, PLAN_DETAILS } from '../constants';
import { MusicTrack, AppSettings, User, PlanTier } from '../types';

interface ListenEarnProps {
  onReward: (amount: number) => void;
  settings: AppSettings;
  user: User;
}

const ListenEarn: React.FC<ListenEarnProps> = ({ onReward, settings, user }) => {
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [completedTracks, setCompletedTracks] = useState<Set<string>>(new Set());
  const [showRewardModal, setShowRewardModal] = useState<{ amount: number } | null>(null);
  const [showAntiCheat, setShowAntiCheat] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const plan = PLAN_DETAILS[user.plan];
  const limitReached = user.songsListenedToday >= plan.songLimit;
  const remainingSongs = plan.songLimit === Infinity ? 'Unlimited' : Math.max(0, plan.songLimit - user.songsListenedToday);

  // Stop playback if user leaves the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        pauseTrack();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  // Timer logic for progress and rewards
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
      const earned = 0.05 + (Math.random() * 0.10);
      setCompletedTracks(prev => new Set(prev).add(activeTrackId));
      onReward(earned);
      setShowRewardModal({ amount: earned });
      setActiveTrackId(null);
    }
  };

  const handleAntiCheat = () => {
    setShowAntiCheat(false);
    startTrack();
  };

  const filteredTracks = MOCK_TRACKS.filter(t => 
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
            <h1 className="text-2xl font-black text-white tracking-tighter italic">Listen & Earn</h1>
            <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em]">{plan.name} Plan Active</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-right mb-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase block leading-none">Remaining Today</span>
              <span className="text-lg font-black text-white">{remainingSongs} <span className="text-gray-500 text-xs">Songs</span></span>
            </div>
            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000" 
                style={{ width: plan.songLimit === Infinity ? '100%' : `${(user.songsListenedToday / plan.songLimit) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-green-500/5 blur-xl group-focus-within:bg-green-500/10 transition-all rounded-3xl"></div>
          <div className="relative flex items-center">
            <i className="fas fa-search absolute left-5 text-gray-500"></i>
            <input 
              type="text" 
              placeholder="Search tracks or artists..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-white/10 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {SONG_CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-black transition-all ${
                activeCategory === cat ? 'bg-green-500 text-black shadow-[0_10px_20px_-5px_rgba(34,197,94,0.4)] scale-105' : 'bg-white/5 text-gray-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredTracks.map((track) => {
            const isActive = activeTrackId === track.id;
            const isDone = completedTracks.has(track.id);
            const progress = isActive ? ((track.duration - timeLeft) / track.duration) * 100 : 0;

            return (
              <div 
                key={track.id} 
                onClick={() => !isDone && togglePlay(track)}
                className={`group relative overflow-hidden glass-card rounded-3xl p-4 flex flex-col transition-all cursor-pointer border ${
                  isActive ? 'border-green-500/40 bg-green-500/5 ring-1 ring-green-500/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]' : 'border-white/5 hover:bg-white/5'
                } ${isDone || limitReached ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center relative overflow-hidden shadow-2xl transition-all group-hover:scale-105 ${
                    isActive ? 'bg-green-500' : 'bg-gradient-to-br from-gray-800 to-gray-900'
                  }`}>
                    {isActive && isPlaying ? (
                      <div className="flex items-end gap-1 h-6">
                        <div className="w-1 bg-black animate-wave h-full rounded-full" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1 bg-black animate-wave h-1/2 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 bg-black animate-wave h-3/4 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 bg-black animate-wave h-1/3 rounded-full" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    ) : (
                      <i className={`fas ${isDone ? 'fa-check' : 'fa-play'} ${isActive ? 'text-black' : 'text-gray-500'} text-xl`}></i>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <h3 className="text-white font-black text-base md:text-lg truncate tracking-tight">{track.title}</h3>
                    <div className="flex items-center gap-3">
                      <p className="text-gray-500 text-xs md:text-sm truncate font-medium">{track.artist}</p>
                      <span className="hidden sm:inline w-1 h-1 bg-gray-700 rounded-full"></span>
                      <span className="text-gray-600 text-[10px] font-black uppercase">{formatTime(track.duration)}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-110' : 'bg-white/5 text-white group-hover:bg-white/10'
                    }`}>
                      <i className={`fas ${isActive && isPlaying ? 'fa-pause' : 'fa-play'} text-sm ml-0.5`}></i>
                    </button>
                  </div>
                </div>

                {isActive && (
                  <div className="mt-5 pt-5 border-t border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Earning In Progress...</span>
                      </div>
                      <span className="text-xs font-black text-white">{timeLeft}s left</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <audio ref={audioRef} onEnded={handleSongEnd} />

      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="glass-card max-w-sm w-full p-12 rounded-[3rem] border border-green-500/20 text-center relative shadow-[0_0_100px_rgba(34,197,94,0.1)]">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-bounce">
               <i className="fas fa-check text-black text-4xl"></i>
            </div>
            <h2 className="text-3xl font-black text-white mt-8 mb-4 tracking-tighter leading-none">Track Finished!</h2>
            <p className="text-gray-400 mb-8 font-medium">Earned +${showRewardModal.amount.toFixed(2)} (₦{(showRewardModal.amount * settings.usdToNgnRate).toFixed(0)})</p>
            <button 
              onClick={() => setShowRewardModal(null)}
              className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-gray-100 transition-all shadow-xl text-lg transform active:scale-95"
            >
              KEEP EARNING
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wave-move {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
        .animate-wave {
          animation: wave-move 0.7s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ListenEarn;
