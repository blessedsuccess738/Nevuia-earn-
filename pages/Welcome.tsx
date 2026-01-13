
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

  return (
    <div className="h-[100dvh] bg-[#050505] text-white flex flex-col items-center justify-start overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full"></div>
      </div>

      <div className="w-full relative z-20 bg-black/40 backdrop-blur-md py-1.5 px-4 border-b border-white/5 flex justify-center items-center">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1 w-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1 w-1 bg-green-500"></span>
          </span>
          <p className="text-[8px] font-black uppercase tracking-tighter text-gray-500">
            <span className="text-white">@{LIVE_FEEDS[feedIndex].user}</span> 
            <span className="mx-1">+{LIVE_FEEDS[feedIndex].type}</span>
            <span className="text-green-500 font-black">₦{LIVE_FEEDS[feedIndex].amount.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md flex-grow flex flex-col items-center px-5 pt-2 overflow-y-auto no-scrollbar pb-6">
        <div className="flex items-center gap-2 mb-3 animate-in fade-in zoom-in duration-500 shrink-0">
          <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <i className="fas fa-headphones text-black text-xs"></i>
          </div>
          <h1 className="text-lg font-black tracking-tighter italic neon-glow">BEATBUCKS</h1>
        </div>

        {view === 'hero' ? (
          <div className="w-full flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-4">
              <h2 className="text-3xl font-black tracking-tighter leading-none mb-1 uppercase">
                LISTEN & <br /> <span className="text-green-500 italic">GET PAID DAILY</span>
              </h2>
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest leading-none">
                Earning made simple through audio.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full mb-4">
              <div className="glass-card p-3 rounded-2xl border border-white/5 text-left">
                <i className="fas fa-bolt text-green-500 mb-1 text-[10px]"></i>
                <h3 className="text-[8px] font-black uppercase mb-0.5">Fast Payouts</h3>
                <p className="text-[7px] text-gray-500 font-bold leading-tight">Instant bank transfers via Paystack verified infra.</p>
              </div>
              <div className="glass-card p-3 rounded-2xl border border-white/5 text-left">
                <i className="fas fa-shield-alt text-blue-500 mb-1 text-[10px]"></i>
                <h3 className="text-[8px] font-black uppercase mb-0.5">Secure Vault</h3>
                <p className="text-[7px] text-gray-500 font-bold leading-tight">Your earnings are protected by AES encryption.</p>
              </div>
            </div>

            <div className="w-full text-left mb-5 space-y-2">
               <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                  <h4 className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-1">Earning Model</h4>
                  <p className="text-[7px] text-gray-400 font-medium leading-normal italic">
                    Artists pay for distribution, you receive 70% of ad-revenue for every 30s stream. Daily claimable bonuses and referral rewards keep your balance growing.
                  </p>
               </div>
            </div>

            <div className="w-full space-y-2 shrink-0">
              <button onClick={() => setView('signup')} className="w-full py-3.5 bg-green-500 text-black font-black rounded-xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-[0.2em]">GET STARTED NOW</button>
              <button onClick={() => setView('login')} className="w-full py-3.5 bg-white/5 border border-white/10 text-white font-black rounded-xl active:scale-95 transition-all text-xs uppercase tracking-[0.2em]">ACCESS WALLET</button>
            </div>

            <p className="mt-4 text-[7px] text-gray-700 font-black uppercase tracking-[0.3em]">Licensed Music Payout System &copy; 2024</p>
          </div>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-400">
            <div className="glass-card p-5 rounded-[2.5rem] border border-white/5 relative overflow-hidden w-full">
              <div className="text-center mb-3">
                <h2 className="text-xl font-black uppercase italic tracking-tighter mb-0.5">{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                <div className="w-6 h-1 bg-green-500 mx-auto rounded-full"></div>
              </div>

              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 py-1.5 px-3 rounded-xl text-[8px] font-black uppercase mb-3 text-center">{error}</div>}

              <form onSubmit={handleAuth} className="space-y-2">
                {view === 'signup' && (
                  <>
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Username</label>
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="CoolEarner" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-green-500" />
                    </div>
                  </>
                )}
                <div className="space-y-0.5">
                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@domain.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-green-500" />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-green-500" />
                </div>
                {view === 'signup' && (
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Referral Code (Optional)</label>
                    <input type="text" value={refCode} onChange={e => setRefCode(e.target.value)} placeholder="XYZ123" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-green-500" />
                  </div>
                )}

                <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-green-500 text-black font-black rounded-xl shadow-lg mt-2 uppercase tracking-widest text-xs active:scale-95 transition-all">
                  {isLoading ? 'Verifying...' : (view === 'login' ? 'Login' : 'Join Now')}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-[8px] font-black text-gray-500 hover:text-white uppercase tracking-widest">
                  {view === 'login' ? "New Earner? Register" : "Existing Member? Sign In"}
                </button>
              </div>
            </div>

            <button onClick={() => setView('hero')} className="mt-4 text-gray-700 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto font-black text-[8px] tracking-widest uppercase">
              <i className="fas fa-arrow-left text-[6px]"></i> Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Welcome;
