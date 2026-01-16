
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showRewardModal, setShowRewardModal] = useState<{ amount: number } | null>(null);
  const [timeToReset, setTimeToReset] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeRef = useRef(0);

  const plan = PLAN_DETAILS[user.plan];
  const limitReached = user.songsListenedToday >= plan.songLimit;
  const remainingSongs = plan.songLimit === Infinity ? 'Unlimited' : Math.max(0, plan.songLimit - user.songsListenedToday);

  // Trial logic: 3-day limit for FREE tier
  const createdAt = new Date(user.createdAt || new Date().toISOString());
  const trialExpiryDate = new Date(createdAt);
  trialExpiryDate.setDate(trialExpiryDate.getDate() + 3);
  const isTrialExpired = user.plan === PlanTier.FREE && new Date() > trialExpiryDate;

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
    if (isTrialExpired) {
      alert("Your 3-day FREE trial has expired. Upgrade your plan to continue earning!");
      return;
    }

    if (user.playedTracksToday.includes(track.id)) return;
    if (limitReached) return;

    if (activeTrackId === track.id) {
      if (isPlaying) {
        setIsPlaying(false);
        audioRef.current?.pause();
      } else {
        setIsPlaying(true);
        audioRef.current?.play();
      }
    } else {
      setActiveTrackId(track.id);
      setCurrentTime(0);
      lastTimeRef.current = 0;
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      if (current > lastTimeRef.current + 2) {
        audioRef.current.currentTime = lastTimeRef.current;
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
      {/* Header & Player UI */}
      <div className="w-full sticky top-0 z-40 bg-black/40 backdrop-blur-3xl border-b border-white/10 p-6">
        {isTrialExpired && (
          <div className="bg-red-600 text-white text-[10px] font-black py-2 text-center uppercase tracking-widest mb-4">
            Trial Expired - Upgrade to Continue Earning
          </div>
        )}
        <div className="max-w-5xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                 <i className="fas fa-headphones text-black"></i>
              </div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter">Music Vault</h1>
           </div>
           <div className="text-right">
              <p className="text-[9px] text-gray-500 font-black uppercase">Next Reset In</p>
              <p className="text-sm font-black italic">{timeToReset}</p>
           </div>
        </div>
      </div>

      <div className="w-full max-w-4xl px-6 pt-12 space-y-8">
        <div className="relative">
          <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-600"></i>
          <input 
            type="text" 
            placeholder="Search tracks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-14 pr-6 text-white font-bold"
          />
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
          {['All', ...SONG_CATEGORIES].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl whitespace-nowrap text-[11px] font-black uppercase tracking-widest transition-all border ${
                activeCategory === cat 
                ? 'bg-white text-black border-transparent shadow-xl scale-105' 
                : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20'
              }`}
            >
              {cat === 'All' ? (
                <i className={`${CATEGORY_ICONS[cat]} text-sm`}></i>
              ) : (
                <div className="w-6 h-6 relative">
                  <img src={CATEGORY_ICONS[cat]} className="w-full h-full object-contain" alt="" />
                </div>
              )}
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredTracks.map(track => {
            const isActive = activeTrackId === track.id;
            const isPlayed = user.playedTracksToday.includes(track.id);
            return (
              <div 
                key={track.id}
                onClick={() => !isPlayed && togglePlay(track)}
                className={`glass-card p-5 rounded-2xl border flex items-center gap-5 transition-all ${
                  isActive ? 'border-green-500 bg-green-500/10' : 'border-white/5'
                } ${isPlayed || isTrialExpired ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <img src={track.albumArt} className="w-16 h-16 rounded-xl object-cover" alt="" />
                <div className="flex-grow">
                  <h3 className="text-white font-black text-sm uppercase italic">{track.title}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{track.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-4 h-4 relative">
                        <img src={CATEGORY_ICONS[track.category]} className="w-full h-full object-contain" alt="" />
                     </div>
                     <p className="text-green-500 text-[10px] font-black">+${track.earningUSD.toFixed(2)}</p>
                  </div>
                </div>
                {isActive && isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
              </div>
            );
          })}
        </div>
      </div>

      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
      />

      {showRewardModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
           <div className="glass-card max-w-sm w-full p-10 rounded-[3rem] text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <i className="fas fa-check text-black text-2xl"></i>
              </div>
              <h2 className="text-2xl font-black uppercase italic mb-2">Rewards Claimed!</h2>
              <p className="text-sm text-gray-500 font-bold uppercase mb-8">You earned +${showRewardModal.amount.toFixed(2)}</p>
              <button onClick={() => setShowRewardModal(null)} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest">Continue</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ListenEarn;
