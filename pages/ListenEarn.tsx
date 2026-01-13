
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_TRACKS } from '../constants';
import { MusicTrack, AppSettings, User } from '../types';

interface ListenEarnProps {
  onReward: (amount: number) => void;
  settings: AppSettings;
  user: User;
}

const ListenEarn: React.FC<ListenEarnProps> = ({ onReward, settings, user }) => {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(MOCK_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(currentTrack.duration);
  const [isFinished, setIsFinished] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [showAntiCheat, setShowAntiCheat] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Handle tab switching visibility
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
    } else if (timeLeft === 0) {
      handleSongEnd();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeLeft]);

  const startTrack = () => {
    if (user.dailyEarnings >= settings.dailyCapUSD) {
      alert("Daily earning limit reached! Come back tomorrow.");
      return;
    }
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
    
    // Random earnings between $0.05 and $0.20
    const earned = Math.random() * (0.20 - 0.05) + 0.05;
    const finalEarned = Math.min(earned, settings.dailyCapUSD - user.dailyEarnings);
    
    setRewardAmount(finalEarned);
    setIsFinished(true);
    onReward(finalEarned);
  };

  const nextTrack = () => {
    const nextIdx = (MOCK_TRACKS.indexOf(currentTrack) + 1) % MOCK_TRACKS.length;
    const nextT = MOCK_TRACKS[nextIdx];
    setCurrentTrack(nextT);
    setTimeLeft(nextT.duration);
    setIsFinished(false);
    setRewardAmount(null);
    setIsPlaying(false);
  };

  const handleAntiCheat = () => {
    setShowAntiCheat(false);
    startTrack();
  };

  useEffect(() => {
    // Random anti-cheat popup logic
    if (isPlaying && Math.random() < 0.05 && timeLeft > 5) {
      pauseTrack();
      setShowAntiCheat(true);
    }
  }, [timeLeft]);

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <div className="glass-card rounded-[40px] p-8 md:p-16 border border-white/5 text-center relative overflow-hidden">
        {/* Animated Background Pulse */}
        <div className={`absolute inset-0 bg-green-500/5 transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-48 h-48 md:w-64 md:h-64 rounded-[2rem] bg-gradient-to-br from-green-500 to-blue-600 p-1 mb-8 shadow-2xl transition-all duration-500 ${isPlaying ? 'scale-105 rotate-3' : 'scale-100 rotate-0'}`}>
            <div className="w-full h-full bg-black rounded-[1.8rem] flex items-center justify-center overflow-hidden">
               <i className={`fas fa-compact-disc text-6xl md:text-8xl text-white/20 ${isPlaying ? 'animate-spin-slow' : ''}`}></i>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-black mb-2">{currentTrack.title}</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-8">{currentTrack.artist}</p>

          {/* Player Progress */}
          <div className="w-full max-w-md mb-8">
            <div className="flex justify-between text-xs text-gray-500 font-bold mb-2">
              <span>{Math.floor((currentTrack.duration - timeLeft) / 60)}:{(currentTrack.duration - timeLeft) % 60 < 10 ? '0' : ''}{(currentTrack.duration - timeLeft) % 60}</span>
              <span className="text-green-500 uppercase tracking-tighter">Listen to Earn</span>
              <span>{Math.floor(currentTrack.duration / 60)}:{currentTrack.duration % 60 < 10 ? '0' : ''}{currentTrack.duration % 60}</span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-green-500 transition-all duration-1000" 
                style={{ width: `${((currentTrack.duration - timeLeft) / currentTrack.duration) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-8">
            <button className="text-gray-500 hover:text-white transition-colors">
              <i className="fas fa-step-backward text-2xl"></i>
            </button>
            <button 
              onClick={isPlaying ? pauseTrack : startTrack}
              disabled={isFinished}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                isFinished ? 'bg-gray-800 cursor-not-allowed' : 'bg-green-500 hover:bg-green-400 transform hover:scale-110'
              }`}
            >
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-2xl text-black ml-1`}></i>
            </button>
            <button 
              onClick={nextTrack}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <i className="fas fa-step-forward text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Reward Overlay */}
        {isFinished && rewardAmount && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <i className="fas fa-dollar-sign text-black text-4xl"></i>
            </div>
            <h3 className="text-4xl font-black text-white mb-2">Earnings Secured!</h3>
            <p className="text-xl text-green-500 font-bold mb-8">+${rewardAmount.toFixed(2)} USD added to wallet</p>
            <button 
              onClick={nextTrack}
              className="px-8 py-3 bg-white text-black font-black rounded-full hover:bg-gray-200 transition-all"
            >
              Next Song
            </button>
          </div>
        )}

        {/* Anti-Cheat Modal */}
        {showAntiCheat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6">
            <div className="glass-card max-w-sm w-full p-8 rounded-3xl border border-red-500/50 text-center">
              <i className="fas fa-hand-pointer text-4xl text-red-500 mb-4 animate-pulse"></i>
              <h2 className="text-2xl font-black mb-2">Are you still here?</h2>
              <p className="text-gray-400 mb-6">Tap the button below within 5 seconds to continue earning. Auto-pause triggered.</p>
              <button 
                onClick={handleAntiCheat}
                className="w-full bg-red-500 text-white font-black py-4 rounded-xl hover:bg-red-400 transition-all"
              >
                I'M LISTENING
              </button>
            </div>
          </div>
        )}

        <audio 
          ref={audioRef}
          src={currentTrack.url}
          onEnded={handleSongEnd}
        />
      </div>

      <div className="mt-8 glass-card p-6 rounded-2xl border border-white/5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <i className="fas fa-info-circle text-green-500"></i>
        </div>
        <p className="text-gray-400 text-sm">
          Keep this tab active to ensure earnings are credited. Leaving the page or switching tabs will pause the timer. Daily cap: <span className="text-white font-bold">${settings.dailyCapUSD.toFixed(2)}</span>.
        </p>
      </div>
    </div>
  );
};

export default ListenEarn;
