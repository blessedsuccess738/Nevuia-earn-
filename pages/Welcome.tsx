
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface WelcomeProps {
  onLogin: (email: string) => boolean;
  onRegister: (username: string, email: string, ref?: string) => void;
}

type ViewState = 'hero' | 'signup' | 'login';

const LIVE_FEEDS = [
  { user: 'Oluwaseun', amount: 5500, type: 'Payout' },
  { user: 'Chioma', amount: 4800, type: 'Activation' },
  { user: 'Musa', amount: 12000, type: 'Payout' },
  { user: 'Blessing', amount: 8400, type: 'Activation' },
  { user: 'Emeka', amount: 7200, type: 'Payout' },
];

const BUBBLES = [
  { icon: 'fa-spotify', color: 'text-[#1DB954]', top: '10%', left: '5%', size: '3.5rem', delay: '0s' },
  { icon: 'fa-apple', color: 'text-white', top: '25%', left: '85%', size: '4.5rem', delay: '2s' },
  { icon: 'fa-play', color: 'text-[#f6d72a]', top: '60%', left: '15%', size: '3rem', delay: '4s' }, // Boomplay yellow
  { icon: 'fa-bolt', color: 'text-[#ffa200]', top: '75%', left: '75%', size: '4rem', delay: '1s' }, // Audiomack orange
  { icon: 'fa-soundcloud', color: 'text-[#ff5500]', top: '40%', left: '45%', size: '2.5rem', delay: '5s' },
  { icon: 'fa-youtube', color: 'text-[#FF0000]', top: '85%', left: '20%', size: '3.8rem', delay: '3s' },
  { icon: 'fa-amazon', color: 'text-[#FF9900]', top: '5%', left: '70%', size: '2.8rem', delay: '6s' },
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

  if (view !== 'hero') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Auth Background Bubbles */}
        {BUBBLES.map((b, i) => (
          <i key={i} className={`fab ${b.icon} bubble-icon ${b.color}`} style={{ top: b.top, left: b.left, fontSize: b.size, animationDelay: b.delay }}></i>
        ))}

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
      {/* Dynamic Bubble Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {BUBBLES.map((b, i) => (
          <i key={i} className={`fab ${b.icon} bubble-icon ${b.color}`} style={{ top: b.top, left: b.left, fontSize: b.size, animationDelay: b.delay }}></i>
        ))}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,_rgba(34,197,94,0.15),_transparent_60%)]"></div>
      </div>

      {/* Corporate Nav Bar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 py-3 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
             <i className="fas fa-headphones text-black text-xs"></i>
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

        {/* Institutional Partners Grid */}
        <section className="mb-24">
           <p className="text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mb-8">Integrated Partners Ecosystem</p>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Spotify', icon: 'fa-spotify', color: 'text-[#1DB954]' },
                { name: 'Apple Music', icon: 'fa-apple', color: 'text-white' },
                { name: 'Audiomack', icon: 'fa-bolt', color: 'text-[#ffa200]' },
                { name: 'Boomplay', icon: 'fa-play', color: 'text-[#f6d72a]' }
              ].map(p => (
                <div key={p.name} className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                   <i className={`fab ${p.icon} text-3xl ${p.color} filter drop-shadow-[0_0_10px_currentColor]`}></i>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{p.name}</span>
                </div>
              ))}
           </div>
        </section>

        {/* Core Value Pillars */}
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

        {/* Long Text Deep Resources */}
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

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-10 rounded-[3rem] border border-white/5">
                 <h4 className="text-xs font-black text-green-500 uppercase tracking-[0.3em] mb-4">Security Standards</h4>
                 <p className="text-xs text-gray-500 leading-relaxed font-bold uppercase">
                    Our platform is built on enterprise infrastructure. We utilize SSL/TLS 1.3 for all data transit and partner with licensed financial processors to handle fiat settlements. Your account is protected by multi-factor session monitoring to prevent unauthorized access.
                 </p>
              </div>
              <div className="glass-card p-10 rounded-[3rem] border border-white/5">
                 <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Network Growth</h4>
                 <p className="text-xs text-gray-500 leading-relaxed font-bold uppercase">
                    BeatBucks has distributed over $2M+ to listeners across the Sub-Saharan region in 2024 alone. By maintaining a strict activation-to-payout ratio, we ensure the stability of our liquidity pool, making us the most reliable earner platform in the market.
                 </p>
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

      {/* Corporate Footer Resources */}
      <footer className="w-full bg-black border-t border-white/5 pt-16 pb-12 px-8 relative z-10">
         <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1 space-y-6">
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                    <i className="fas fa-headphones text-black text-[10px]"></i>
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
                  <li className="hover:text-green-500 cursor-pointer">API Documentation</li>
               </ul>
            </div>
            <div className="space-y-4">
               <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Resources</h5>
               <ul className="text-[9px] text-gray-600 font-black uppercase space-y-2">
                  <li className="hover:text-green-500 cursor-pointer">Corporate Careers</li>
                  <li className="hover:text-green-500 cursor-pointer">Compliance Policy</li>
                  <li className="hover:text-green-500 cursor-pointer">Help Center</li>
                  <li className="hover:text-green-500 cursor-pointer">Terms of Service</li>
               </ul>
            </div>
            <div className="space-y-4">
               <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Connect</h5>
               <div className="flex gap-4">
                  <i className="fab fa-twitter text-gray-500 hover:text-white cursor-pointer transition-colors"></i>
                  <i className="fab fa-telegram text-gray-500 hover:text-white cursor-pointer transition-colors"></i>
                  <i className="fab fa-instagram text-gray-500 hover:text-white cursor-pointer transition-colors"></i>
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
