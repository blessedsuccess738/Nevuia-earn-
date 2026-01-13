
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface WelcomeProps {
  onLogin: (email: string) => boolean;
  onRegister: (username: string, email: string) => void;
}

type ViewState = 'hero' | 'signup' | 'login';

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  required?: boolean;
  optional?: boolean;
  showToggle?: boolean;
  showPasswordState?: boolean;
  onTogglePassword?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  optional = false,
  showToggle = false,
  showPasswordState = false,
  onTogglePassword
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative mb-4 group">
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        isFocused || value ? '-top-2 text-xs text-green-500 font-bold bg-[#050505] px-2' : 'top-4 text-gray-500 font-medium'
      }`}>
        {label} {optional && <span className="text-gray-600 text-[10px] font-bold uppercase">(Optional)</span>}
      </label>
      <input 
        type={showToggle && showPasswordState ? 'text' : type}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full bg-transparent border ${isFocused ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.25)]' : 'border-white/10'} rounded-2xl px-5 py-4 focus:outline-none text-white transition-all font-medium`}
        placeholder={isFocused ? placeholder : ''}
      />
      {showToggle && (
        <button 
          type="button"
          onClick={onTogglePassword}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
        >
          <i className={`fas ${showPasswordState ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
      )}
    </div>
  );
};

const Welcome: React.FC<WelcomeProps> = ({ onLogin, onRegister }) => {
  const [view, setView] = useState<ViewState>('hero');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referral, setReferral] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (view === 'login') {
      if (onLogin(email)) {
        navigate('/dashboard');
      } else {
        setError('Login failed. Please check your credentials.');
        setIsLoading(false);
      }
    } else {
      if (!username || !email || !password) {
        setError('All fields are required.');
        setIsLoading(false);
        return;
      }
      onRegister(username, email);
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-[#050505] overflow-x-hidden selection:bg-green-500 selection:text-black">
      {/* Immersive Atmospheric Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-900/10 to-transparent"></div>
        <div className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] bg-green-500/5 blur-[180px] rounded-full animate-slow-pulse"></div>
        <div className="absolute bottom-1/3 -right-1/4 w-[700px] h-[700px] bg-blue-600/5 blur-[200px] rounded-full animate-slow-pulse delay-1000"></div>
        
        {/* Particle Ambience */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-[2px] h-[2px] bg-white rounded-full animate-float-slow"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${20 + Math.random() * 30}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className={`relative z-10 w-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col items-center px-4 pt-8 pb-20 ${view !== 'hero' ? 'opacity-0 scale-95 pointer-events-none absolute -translate-y-20' : 'opacity-100 scale-100 translate-y-0'}`}>
        
        {/* High-Impact Top Section */}
        <div className="max-w-4xl w-full text-center space-y-6 mb-12 animate-fade-in-up">
           {/* Sound Visualizer */}
          <div className="flex justify-center space-x-1.5 h-12 items-end mb-4">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="wave-bar !w-[4px]" 
                style={{ 
                  animationDelay: `${i * 0.05}s`, 
                  height: `${10 + Math.random() * 40}px`,
                  animationDuration: `${0.8 + Math.random() * 0.8}s`
                }}
              ></div>
            ))}
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.95] text-white">
            Turn Every Sound <br />
            <span className="text-green-500 neon-glow">Into Real Money.</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-400 font-bold max-w-xl mx-auto">
            The world's first platform powered by your attention and the music you love.
          </p>

          {/* Primary Action Button - Moved to Top */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button 
              onClick={() => setView('signup')}
              className="w-full sm:w-auto px-10 py-5 bg-green-500 text-black font-black text-lg rounded-2xl transition-all hover:bg-green-400 shadow-[0_20px_40px_-10px_rgba(34,197,94,0.4)] transform active:scale-95 flex items-center justify-center gap-3"
            >
              CREATE FREE ACCOUNT
              <i className="fas fa-chevron-right text-sm"></i>
            </button>
            <button 
              onClick={() => setView('login')}
              className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-lg rounded-2xl hover:bg-white/10 transition-all active:scale-95"
            >
              LOGIN
            </button>
          </div>
        </div>

        {/* Dense Feature & Story Section - Button-style Cards */}
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          
          <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col gap-3 group hover:border-green-500/30 transition-all cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                <i className="fas fa-headphones-alt text-xl"></i>
              </div>
              <h3 className="text-xl font-black text-white">The Listening Protocol</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              Listen to real music, stay engaged, and earn real rewards. This platform was built for people who want something simple, enjoyable, and different from traditional earning systems. We leverage the power of audio attention to generate value that goes straight into your pocket. No skills, just sound.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col gap-3 group hover:border-blue-500/30 transition-all cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <i className="fas fa-bolt text-xl"></i>
              </div>
              <h3 className="text-xl font-black text-white">Absolute Simplicity</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              You don’t need trading skills, referrals, or experience. You don’t need to sell anything or invite anyone. Every song you listen to adds value to your account. Every completed track moves your balance forward. Music plays, time passes, and your balance grows automatically.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col gap-3 group hover:border-purple-500/30 transition-all cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <h3 className="text-xl font-black text-white">Real-Time Growth</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              Earn in dollars and track your progress in real time. We offer a fair earning system built for consistency, not shortcuts. Withdraw your earnings securely to your local bank or via USDT when you’re ready. Transparency is our foundation—every cent you earn is visible and yours to keep.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col gap-3 group hover:border-red-500/30 transition-all cursor-default">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <i className="fas fa-shield-check text-xl"></i>
              </div>
              <h3 className="text-xl font-black text-white">Anti-Fraud Security</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              Our system is protected by advanced anti-fraud algorithms and random active-listening checks. This ensures that only real humans with real ears earn rewards. This protection maintains the platform's stability and ensures long-term profitability for every dedicated member of our community.
            </p>
          </div>

          {/* Full-width Story Button-Card */}
          <div className="md:col-span-2 glass-card p-8 rounded-[2.5rem] border border-green-500/10 bg-green-500/[0.02] flex flex-col md:flex-row items-center gap-8 group">
            <div className="flex-1 space-y-4">
              <h3 className="text-3xl font-black text-white tracking-tighter italic">Why we exist.</h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                In a digital world where your attention is sold for billions, we believe you should be the one profiting. Our mission is to democratize the value of audio engagement. Whether you're commuting, working out, or relaxing, your ears are working for you. Welcome to the future of passive-active income.
              </p>
              <div className="flex gap-4">
                <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full text-gray-500 uppercase">Secure</span>
                <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full text-gray-500 uppercase">Transparent</span>
                <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full text-gray-500 uppercase">Universal</span>
              </div>
            </div>
            <button 
              onClick={() => setView('signup')}
              className="w-full md:w-auto whitespace-nowrap bg-white text-black font-black px-12 py-5 rounded-2xl hover:bg-gray-200 transition-all"
            >
              JOIN BEATBUCKS
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <div className="flex items-center justify-center gap-4 text-gray-500 font-bold mt-12 mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="w-8 h-[1px] bg-gray-800"></div>
          <p className="text-[10px] tracking-[0.3em] uppercase">Built for consistency. Optimized for mobile.</p>
          <div className="w-8 h-[1px] bg-gray-800"></div>
        </div>
      </div>

      {/* Auth Views */}
      <div className={`relative z-10 transition-all duration-700 w-full max-w-md px-6 flex flex-col justify-center min-h-screen ${view === 'hero' ? 'opacity-0 translate-y-20 pointer-events-none fixed' : 'opacity-100 translate-y-0'}`}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-1.5 bg-green-500 rounded-full mb-8 shadow-[0_0_20px_rgba(34,197,94,0.4)]"></div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">
            {view === 'login' ? 'Secure Login' : 'Create Account'}
          </h2>
          <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">
            {view === 'login' ? 'Welcome back to the dashboard' : 'Join thousands of listeners today'}
          </p>
        </div>

        <div className="glass-card p-8 rounded-[3rem] border border-white/5 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-3 animate-shake">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth}>
            {view === 'signup' && (
              <InputField 
                label="Full Name" 
                type="text" 
                value={username} 
                onChange={setUsername} 
                placeholder="Enter your name" 
                required 
              />
            )}
            
            <InputField 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={setEmail} 
              placeholder="name@example.com" 
              required 
            />

            <InputField 
              label="Password" 
              type="password" 
              value={password} 
              onChange={setPassword} 
              placeholder="••••••••" 
              required 
              showToggle 
              showPasswordState={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {view === 'signup' && (
              <InputField 
                label="Referral ID" 
                type="text" 
                value={referral} 
                onChange={setReferral} 
                placeholder="Optional" 
                optional 
              />
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 mt-4 ${
                isLoading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-black hover:bg-green-400 shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
                  PLEASE WAIT...
                </>
              ) : (
                view === 'login' ? 'SIGN IN' : 'GET STARTED'
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
              {view === 'login' ? "New around here?" : "Already a member?"}
            </p>
            <button 
              onClick={() => {
                setView(view === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="text-white font-black hover:text-green-500 transition-colors uppercase tracking-[0.2em] text-[10px] pb-1 border-b border-white/10"
            >
              {view === 'login' ? 'Create Free Account' : 'Back to Login'}
            </button>
          </div>
        </div>

        <button 
          onClick={() => { setView('hero'); setError(''); }}
          className="mt-10 text-gray-600 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto font-black text-[10px] tracking-widest"
        >
          <i className="fas fa-chevron-left"></i>
          RETURN TO HOME
        </button>
      </div>

      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slow-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-slow-pulse {
          animation: slow-pulse 10s ease-in-out infinite;
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -30px); }
          50% { transform: translate(-20px, 20px); }
        }
        .animate-float-slow {
          animation: float-slow linear infinite;
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default Welcome;
