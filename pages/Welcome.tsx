
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BOOMPLAY_PNG, AUDIOMACK_PNG, SPOTIFY_PNG } from '../constants';

interface WelcomeProps {
  onLogin: (email: string) => boolean;
  onRegister: (username: string, email: string, ref?: string) => void;
}

type ViewState = 'hero' | 'signup' | 'login';

const LIVE_FEEDS = [
  { user: 'Oluwaseun', amount: 5500 },
  { user: 'Chioma', amount: 4800 },
  { user: 'Musa', amount: 12000 },
  { user: 'Blessing', amount: 8400 },
  { user: 'Emeka', amount: 7200 },
];

const BUBBLES = [
  { img: SPOTIFY_PNG, top: '35%', left: '85%', size: '3.5rem', delay: '3s' },
  { img: AUDIOMACK_PNG, top: '75%', left: '75%', size: '6rem', delay: '1.5s' },
  { img: BOOMPLAY_PNG, top: '15%', left: '10%', size: '5rem', delay: '0s' },
  { img: SPOTIFY_PNG, top: '55%', left: '5%', size: '4rem', delay: '4.5s' },
  { img: BOOMPLAY_PNG, top: '85%', left: '20%', size: '3rem', delay: '2s' },
  { img: AUDIOMACK_PNG, top: '10%', left: '60%', size: '3.5rem', delay: '5s' },
];

const Welcome: React.FC<WelcomeProps> = ({ onLogin, onRegister }) => {
  const [view, setView] = useState<ViewState>('hero');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [refCode, setRefCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedIndex, setFeedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setFeedIndex(prev => (prev + 1) % LIVE_FEEDS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (view === 'login') {
      if (onLogin(email)) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials.');
        setIsLoading(false);
      }
    } else {
      if (!username || !email || !password) {
        setError('Required fields missing.');
        setIsLoading(false);
        return;
      }
      onRegister(username, email, refCode);
      navigate('/dashboard');
    }
  };

  const BackgroundElements = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {BUBBLES.map((b, i) => (
        <div key={i} className="bubble-icon absolute opacity-20" style={{ 
          top: b.top, 
          left: b.left, 
          animationDelay: b.delay,
          animationDuration: `${10 + i * 2}s`
        }}>
           <img src={b.img} style={{ width: b.size, height: b.size, objectFit: 'contain' }} alt="" />
        </div>
      ))}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,_rgba(34,197,94,0.1),_transparent_70%)]"></div>
    </div>
  );

  if (view !== 'hero') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <BackgroundElements />
        <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-400">
          <div className="glass-card p-8 rounded-[3rem] border border-white/10 relative overflow-hidden w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-0.5">
                {view === 'login' ? 'Secure Login' : 'Create Account'}
              </h2>
              <div className="w-12 h-1 bg-green-500 mx-auto rounded-full"></div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 py-2 px-4 rounded-xl text-xs font-black uppercase mb-4 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {view === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Preferred Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="BeatEarner_01" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-green-500 transition-all" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Business Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="corporate@domain.com" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-green-500 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-green-500 transition-all" />
              </div>
              {view === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Referral Link Code</label>
                  <input type="text" value={refCode} onChange={e => setRefCode(e.target.value)} placeholder="BEAT2024" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-green-500 transition-all" />
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full py-5 bg-green-500 text-black font-black rounded-2xl shadow-[0_10px_40px_rgba(34,197,94,0.3)] mt-4 uppercase tracking-[0.2em] text-sm active:scale-95 transition-all">
                {isLoading ? 'Encrypting...' : (view === 'login' ? 'Proceed to Wallet' : 'Finalize Registration')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                {view === 'login' ? "New Partner? Join the Network" : "Existing Member? Access Secure Vault"}
              </button>
            </div>
          </div>

          <button onClick={() => setView('hero')} className="mt-8 text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-3 mx-auto font-black text-[10px] tracking-widest uppercase">
            <i className="fas fa-arrow-left text-[8px]"></i> Back to Main Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-x-hidden">
      <BackgroundElements />

      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
             <i className="fas fa-headphones text-black text-sm"></i>
          </div>
          <span className="font-black italic tracking-tighter text-lg uppercase neon-glow">BeatBucks Global</span>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setView('login')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Client Login</button>
           <button onClick={() => setView('signup')} className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all">Join Network</button>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-16">
        <div className="w-fit mx-auto bg-white/5 border border-white/10 px-6 py-3 rounded-full mb-12 flex items-center gap-4 animate-in fade-in duration-1000 shadow-2xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
             Live Liquidity Injection: <span className="text-white italic">@{LIVE_FEEDS[feedIndex].user}</span> 
             <span className="mx-3 text-green-500 font-black">+₦{LIVE_FEEDS[feedIndex].amount.toLocaleString()}</span>
          </p>
        </div>

        <section className="text-center mb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase mb-8 italic">
            MONETIZE YOUR <br /> <span className="text-green-500">ATTENTION SPAN.</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-lg font-medium max-w-2xl mx-auto mb-12 leading-relaxed uppercase tracking-[0.2em]">
            The industry's leading institutional bridge for audio capital. Convert verified streams into secure liquidity daily.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => setView('signup')}
              className="px-14 py-6 bg-green-500 text-black font-black rounded-2xl shadow-[0_20px_60px_rgba(34,197,94,0.4)] text-lg uppercase tracking-[0.2em] active:scale-95 transition-all"
            >
              GET STARTED
            </button>
            <button 
              onClick={() => setView('login')}
              className="px-14 py-6 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 text-lg uppercase tracking-[0.2em] active:scale-95 transition-all"
            >
              SIGN IN
            </button>
          </div>
        </section>

        <section className="mb-32">
           <p className="text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.5em] mb-12">Integrated Distribution Ecosystem</p>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="glass-card p-10 rounded-3xl border border-white/5 flex flex-col items-center gap-4 hover:bg-white/5 transition-all group shadow-xl">
                  <i className="fab fa-spotify text-4xl text-green-500 group-hover:scale-110 transition-transform"></i>
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">SPOTIFY</span>
              </div>
              <div className="glass-card p-10 rounded-3xl border border-white/5 flex flex-col items-center gap-4 hover:bg-white/5 transition-all group shadow-xl">
                  <i className="fas fa-play text-4xl text-blue-500 group-hover:scale-110 transition-transform"></i>
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">BOOMPLAY</span>
              </div>
              <div className="glass-card p-10 rounded-3xl border border-white/5 flex flex-col items-center gap-4 hover:bg-white/5 transition-all group shadow-xl">
                  <i className="fas fa-wave-square text-4xl text-orange-500 group-hover:scale-110 transition-transform"></i>
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">AUDIOMACK</span>
              </div>
              <div className="glass-card p-10 rounded-3xl border border-white/5 flex flex-col items-center gap-4 hover:bg-white/5 transition-all group shadow-xl">
                  <i className="fab fa-apple text-4xl text-red-500 group-hover:scale-110 transition-transform"></i>
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">APPLE MUSIC</span>
              </div>
           </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
           <div className="glass-card p-12 rounded-[3rem] border border-white/5 space-y-6">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 text-2xl">
                 <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Real-Time Yields</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-tight">Our algorithm tracks your session duration down to the millisecond, converting high-fidelity streams into stablecoin-backed USD balances instantly.</p>
           </div>
           <div className="glass-card p-12 rounded-[3rem] border border-white/5 space-y-6">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 text-2xl">
                 <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Vault Encryption</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-tight">Earnings are secured in an AES-256 bit encrypted cold-wallet until withdrawal. We employ institutional-grade escrow for every listener in our network.</p>
           </div>
           <div className="glass-card p-12 rounded-[3rem] border border-white/5 space-y-6">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 text-2xl">
                 <i className="fas fa-globe-africa"></i>
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Local Settlement</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-tight">Seamlessly convert USD to NGN at market-leading rates. Direct payouts to over 20+ Nigerian commercial banks via our secure gateway.</p>
           </div>
        </section>

        <section className="text-center mb-32 py-20 bg-gradient-to-b from-green-500/5 to-transparent rounded-[5rem] border border-white/5 shadow-inner">
           <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-6">Ready to Synchronize?</h2>
           <p className="text-gray-500 text-sm font-black uppercase tracking-[0.4em] mb-12">Join 500,000+ Verified Network Partners Today.</p>
           <button 
             onClick={() => setView('signup')}
             className="px-16 py-7 bg-white text-black font-black rounded-3xl shadow-2xl uppercase tracking-[0.3em] hover:bg-green-500 transition-all active:scale-95 text-lg"
           >
             Open Digital Wallet
           </button>
        </section>
      </main>

      <footer className="w-full bg-black border-t border-white/5 pt-20 pb-12 px-10 relative z-10 text-center md:text-left">
         <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2 md:col-span-1 space-y-8">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                    <i className="fas fa-headphones text-black text-[10px]"></i>
                  </div>
                  <span className="font-black italic tracking-tighter text-sm uppercase">BeatBucks</span>
               </div>
               <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-loose">
                  Redefining the relationship between artists and listeners through distributed audio capital.
               </p>
            </div>
         </div>
         <div className="max-w-6xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-700">© 2024 BeatBucks Global. Licensed Audio Monetization Bridge.</p>
         </div>
      </footer>
    </div>
  );
};

export default Welcome;
