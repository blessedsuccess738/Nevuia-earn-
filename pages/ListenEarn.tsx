
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_TRACKS, SONG_CATEGORIES } from '../constants';
import { MusicTrack, AppSettings, User } from '../types';

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

  const activeTrack = MOCK_TRACKS.find(t => t.id === activeTrackId);

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

  // Random Anti-Cheat Popup
  useEffect(() => {
    if (isPlaying && Math.random() < 0.02 && timeLeft > 10) {
      pauseTrack();
      setShowAntiCheat(true);
    }
  }, [timeLeft]);

  const togglePlay = (track: MusicTrack) => {
    if (user.dailyEarnings >= settings.dailyCapUSD) {
      alert("Daily earning limit reached! Come back tomorrow.");
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
      // Switch track
      setActiveTrackId(track.id);
      setTimeLeft(track.duration);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play();
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
      const earned = Math.random() * (0.15 - 0.05) + 0.05;
      const finalEarned = Math.min(earned, settings.dailyCapUSD - user.dailyEarnings);
      
      setCompletedTracks(prev => new Set(prev).add(activeTrackId));
      onReward(finalEarned);
      setShowRewardModal({ amount: finalEarned });
      setActiveTrackId(null);
    }
  };

  const handleAntiCheat = () => {
    setShowAntiCheat(false);
    startTrack();
  };

  const filteredTracks = MOCK_TRACKS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 glass-card border-b border-white/5 px-4 py-4 md:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">Listen & Earn</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Boomplay Rewards Edition</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-bold mb-1">
              Daily Progress: <span className="text-green-500">${user.dailyEarnings.toFixed(2)}</span> / ${settings.dailyCapUSD.toFixed(2)}
            </p>
            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={{ width: `${(user.dailyEarnings / settings.dailyCapUSD) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
          <input 
            type="text" 
            placeholder="Search songs, artists..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-green-500 transition-all"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          {SONG_CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                activeCategory === cat ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/5 text-gray-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Song List */}
        <div className="space-y-2">
          {filteredTracks.map((track, idx) => {
            const isActive = activeTrackId === track.id;
            const isDone = completedTracks.has(track.id);
            const progress = isActive ? ((track.duration - timeLeft) / track.duration) * 100 : 0;

            return (
              <div 
                key={track.id} 
                onClick={() => !isDone && togglePlay(track)}
                className={`group glass-card rounded-2xl p-3 flex flex-col transition-all cursor-pointer border ${
                  isActive ? 'border-green-500/50 bg-green-500/5 scale-[1.02]' : 'border-white/5 hover:bg-white/5'
                } ${isDone ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Album Art Placeholder */}
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex-shrink-0 flex items-center justify-center transition-all ${
                    isActive ? 'bg-green-500' : 'bg-gradient-to-br from-gray-800 to-gray-900'
                  }`}>
                    {isActive && isPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <div className="w-1 bg-black animate-wave h-full rounded-full" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1 bg-black animate-wave h-1/2 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 bg-black animate-wave h-3/4 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    ) : (
                      <i className={`fas ${isDone ? 'fa-check' : 'fa-music'} ${isActive ? 'text-black' : 'text-gray-500'}`}></i>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-white font-bold text-sm md:text-base truncate">{track.title}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-500 text-xs truncate">{track.artist}</p>
                      <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-black uppercase">
                        ${(0.05 + (idx * 0.02)).toFixed(2)} Earn
                      </span>
                    </div>
                  </div>

                  {/* Right Side Info/Play */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-bold hidden sm:inline">{formatTime(track.duration)}</span>
                    <button 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                    >
                      <i className={`fas ${isActive && isPlaying ? 'fa-pause' : 'fa-play'} text-xs ml-0.5`}></i>
                    </button>
                  </div>
                </div>

                {/* Active Expanded State (Progress) */}
                {isActive && (
                  <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter mb-2">
                      <span className="text-green-500">LISTENING... {timeLeft}s remaining</span>
                      <span className="text-gray-500">Progress {Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-1000" 
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

      {/* Invisible Audio Element */}
      <audio ref={audioRef} onEnded={handleSongEnd} />

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-6 animate-in fade-in duration-300">
          <div className="glass-card max-w-sm w-full p-10 rounded-[2.5rem] border border-green-500/30 text-center relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-bounce">
               <i className="fas fa-coins text-black text-4xl"></i>
            </div>
            <h2 className="text-3xl font-black text-white mt-8 mb-2">Payout Secured!</h2>
            <p className="text-gray-400 mb-6 font-medium">You've successfully earned rewards for your listening session.</p>
            <div className="text-4xl font-black text-green-500 mb-8">+${showRewardModal.amount.toFixed(2)}</div>
            <button 
              onClick={() => setShowRewardModal(null)}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all shadow-xl"
            >
              KEEP EARNING
            </button>
          </div>
        </div>
      )}

      {/* Anti-Cheat Modal */}
      {showAntiCheat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 backdrop-blur-xl">
          <div className="glass-card max-w-xs w-full p-8 rounded-[2rem] border border-red-500/50 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-hand-pointer text-red-500 text-2xl animate-pulse"></i>
            </div>
            <h3 className="text-xl font-black mb-2">Attention Required!</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">We noticed you've been listening for a while. Please confirm you're still here to keep earning.</p>
            <button 
              onClick={handleAntiCheat}
              className="w-full bg-red-500 text-white font-black py-4 rounded-xl hover:bg-red-400 transition-all shadow-lg"
            >
              I'M STILL LISTENING
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wave-move {
          0%, 100% { height: 40%; }
          50% { height: 100%; }
        }
        .animate-wave {
          animation: wave-move 0.6s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ListenEarn;
