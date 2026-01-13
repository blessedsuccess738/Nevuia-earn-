
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  { type: 'custom-b', color: '#00ffff', top: '15%', left: '10%', size: '5rem', delay: '0s' },
  { type: 'custom-wave', color: '#ff8c00', top: '75%', left: '75%', size: '6rem', delay: '1.5s' },
  { icon: 'fa-spotify', color: '#1DB954', top: '35%', left: '85%', size: '3.5rem', delay: '3s' },
  { icon: 'fa-apple', color: '#FFFFFF', top: '55%', left: '5%', size: '4rem', delay: '4.5s' },
  { type: 'custom-b', color: '#00ffff', top: '85%', left: '20%', size: '3rem', delay: '2s' },
  { type: 'custom-wave', color: '#ff8c00', top: '10%', left: '60%', size: '3.5rem', delay: '5s' },
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

  const CustomBLogo = ({ color, size, className }: { color: string, size: string, className?: string }) => (
    <div className={`flex items-center justify-center font-black italic select-none ${className}`} style={{ fontSize: size, color: color, textShadow: `0 0 20px ${color}66` }}>
      B
    </div>
  );

  const CustomWaveLogo = ({ color, size, className }: { color: string, size: string, className?: string }) => (
    <div className={`flex items-center justify-center select-none ${className}`} style={{ fontSize: size, color: color, filter: `drop-shadow(0 0 10px ${color}aa)` }}>
      <i className="fas fa-wave-square"></i>
    </div>
  );

  const BackgroundElements = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {BUBBLES.map((b, i) => (
        <div key={i} className="bubble-icon absolute opacity-20" style={{ 
          top: b.top, 
          left: b.left, 
          animationDelay: b.delay,
          animationDuration: `${10 + i * 2}s`
        }}>
           {b.type === 'custom-b' ? <CustomBLogo color={b.color} size={b.size} /> : 
            b.type === 'custom-wave' ? <CustomWaveLogo color={b.color} size={b.size} /> :
            <i className={`fab ${b.icon}`} style={{ color: b.color, fontSize: b.size }}></i>}
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

      {/* Corporate Nav Bar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 py-3 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00ffff] rounded-lg flex items-center justify-center shadow-lg">
             <CustomBLogo color="black" size="14px" />
          </div>
          <span className="font-black italic tracking-tighter text-sm uppercase">BeatBucks Global</span>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setView('login')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Client Login</button>
           <button onClick={() => setView('signup')} className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all">Join Network</button>
        </div>
      </nav>

      {/* Main Content Sections */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-12">
        {/* Live Ticker Banner */}
        <div className="w-fit mx-auto bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 flex items-center gap-3 animate-in fade-in duration-1000">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
             Live Liquidity Injection: <span className="text-white">@{LIVE_FEEDS[feedIndex].user}</span> 
             <span className="mx-2 text-green-500 font-black">+₦{LIVE_FEEDS[feedIndex].amount.toLocaleString()}</span>
          </p>
        </div>

        {/* Hero Section */}
        <section className="text-center mb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase mb-6 italic">
            MONETIZE YOUR <br /> <span className="text-green-500">ATTENTION SPAN.</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium max-w-2xl mx-auto mb-10 leading-relaxed uppercase tracking-widest">
            The world's leading institutional bridge for audio-based revenue. Convert professional streams into secure USD liquidity daily.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setView('signup')}
              className="px-10 py-5 bg-green-500 text-black font-black rounded-2xl shadow-[0_20px_60px_rgba(34,197,94,0.3)] text-base uppercase tracking-[0.2em] active:scale-95 transition-all"
            >
              GET STARTED
            </button>
            <button 
              onClick={() => setView('login')}
              className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 text-base uppercase tracking-[0.2em] active:scale-95 transition-all"
            >
              SIGN IN
            </button>
          </div>
        </section>

        {/* Institutional Partners Grid - Restored with Custom Icons */}
        <section className="mb-24">
           <p className="text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mb-8">Integrated Ecosystem Partners</p>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                  <CustomBLogo color="#00ffff" size="32px" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">BEATBUCKS PRO</span>
              </div>
              <div className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                  <CustomWaveLogo color="#ff8c00" size="32px" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">AUDIO-MAXX</span>
              </div>
              <div className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                  <i className="fab fa-spotify text-3xl text-[#1DB954]"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">SPOTIFY</span>
              </div>
              <div className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                  <i className="fab fa-apple text-3xl text-white"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">APPLE MUSIC</span>
              </div>
           </div>
        </section>

        {/* Core Value Pillars - Restored */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
           <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 text-xl">
                 <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-lg font-black uppercase italic tracking-tighter">Real-Time Yields</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase">Our algorithm tracks your session duration down to the millisecond, converting high-fidelity streams into stablecoin-backed USD balances instantly.</p>
           </div>
           <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 text-xl">
                 <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-lg font-black uppercase italic tracking-tighter">Vault Encryption</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase">Earnings are secured in an AES-256 bit encrypted cold-wallet until withdrawal. We employ institutional-grade escrow for every listener in our network.</p>
           </div>
           <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 text-xl">
                 <i className="fas fa-globe-africa"></i>
              </div>
              <h3 className="text-lg font-black uppercase italic tracking-tighter">Local Settlement</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase">Seamlessly convert USD to NGN at market-leading rates. Direct payouts to over 20+ Nigerian commercial banks via our Paystack gateway.</p>
           </div>
        </section>

        {/* Liquidity Logic - Restored */}
        <section className="space-y-12 mb-24">
           <div className="bg-white/5 border border-white/5 p-12 rounded-[4rem]">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-6">The Liquidity Logic</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                       BeatBucks Global functions as a distributed audience network. Emerging and established artists allocate distribution budgets to boost their streaming metrics on global platforms. Instead of these funds going solely to platform ad-buys, we distribute 70% of this capital directly to active listeners who verify their attention.
                    </p>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">
                       This creates a sustainable ecosystem where artists gain organic algorithmic momentum, and listeners receive professional compensation for their time.
                    </p>
                 </div>
                 <div className="bg-black/50 p-8 rounded-[2rem] border border-white/5 flex flex-col justify-center space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Type</span>
                       <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">PoL (Proof-of-Listening)</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment Infrastructure</span>
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Paystack Integrated</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Compliance Level</span>
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Verified Digital Payouts</span>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Final CTA Section */}
        <section className="text-center mb-24 py-16 bg-gradient-to-b from-green-500/5 to-transparent rounded-[5rem] border border-white/5">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Ready to Synchronize?</h2>
           <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em] mb-8">Join 500,000+ Verified Network Partners Today.</p>
           <button 
             onClick={() => setView('signup')}
             className="px-12 py-6 bg-white text-black font-black rounded-3xl shadow-2xl uppercase tracking-[0.3em] hover:bg-green-500 transition-all active:scale-95"
           >
             Open Digital Wallet
           </button>
        </section>
      </main>

      {/* Corporate Footer - Restored */}
      <footer className="w-full bg-black border-t border-white/5 pt-16 pb-12 px-8 relative z-10 text-center md:text-left">
         <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1 space-y-6">
               <div className="flex items-center gap-2 justify-center md:justify-start">
                  <div className="w-6 h-6 bg-[#00ffff] rounded flex items-center justify-center">
                    <CustomBLogo color="black" size="10px" />
                  </div>
                  <span className="font-black italic tracking-tighter text-xs uppercase">BeatBucks</span>
               </div>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-loose">
                  Redefining the relationship between artists and listeners through distributed audio capital.
               </p>
            </div>
            <div className="space-y-4">
               <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Ecosystem</h5>
               <ul className="text-[9px] text-gray-600 font-black uppercase space-y-2">
                  <li className="hover:text-green-500 cursor-pointer">Listen & Earn Portal</li>
                  <li className="hover:text-green-500 cursor-pointer">Protocol Whitepaper</li>
                  <li className="hover:text-green-500 cursor-pointer">Artist Dashboard</li>
               </ul>
            </div>
            <div className="space-y-4">
               <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Resources</h5>
               <ul className="text-[9px] text-gray-600 font-black uppercase space-y-2">
                  <li className="hover:text-green-500 cursor-pointer">Corporate Careers</li>
                  <li className="hover:text-green-500 cursor-pointer">Compliance Policy</li>
                  <li className="hover:text-green-500 cursor-pointer">Help Center</li>
               </ul>
            </div>
            <div className="space-y-4">
               <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Connect</h5>
               <div className="flex gap-4 justify-center md:justify-start">
                  <i className="fab fa-twitter text-gray-500 hover:text-white cursor-pointer transition-colors"></i>
                  <i className="fab fa-telegram text-gray-500 hover:text-white cursor-pointer transition-colors"></i>
               </div>
               <p className="text-[8px] text-gray-700 font-black uppercase leading-tight">
                  support@beatbucks.global <br />
                  Lagos HQ | Virtual Office
               </p>
            </div>
         </div>
         <div className="text-center pt-8 border-t border-white/5">
            <p className="text-[8px] text-gray-800 font-black uppercase tracking-[0.5em]">
               &copy; 2024 BEATBUCKS GLOBAL ACTIVATIONS LTD | ALL RIGHTS RESERVED
            </p>
         </div>
      </footer>
    </div>
  );
};

export default Welcome;
