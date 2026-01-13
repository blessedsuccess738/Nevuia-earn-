
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
    <div className="relative mb-6 group">
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${
        isFocused || value ? '-top-2 text-xs text-green-500 font-bold bg-[#050505] px-2' : 'top-4 text-gray-500'
      }`}>
        {label} {optional && <span className="text-gray-600 text-[10px]">(Optional)</span>}
      </label>
      <input 
        type={showToggle && showPasswordState ? 'text' : type}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full bg-transparent border ${isFocused ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'border-white/10'} rounded-xl px-4 py-4 focus:outline-none text-white transition-all`}
        placeholder={isFocused ? placeholder : ''}
      />
      {showToggle && (
        <button 
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
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

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (view === 'login') {
      if (onLogin(email)) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials or user not found.');
        setIsLoading(false);
      }
    } else {
      if (!username || !email || !password) {
        setError('Please fill all required fields.');
        setIsLoading(false);
        return;
      }
      onRegister(username, email);
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-[#050505]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-900/5 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 blur-[150px] rounded-full animate-pulse delay-700"></div>
        
        {/* Particle Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-white rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className={`relative z-10 transition-all duration-700 flex flex-col items-center max-w-4xl w-full ${view !== 'hero' ? 'opacity-0 scale-95 pointer-events-none absolute' : 'opacity-100 scale-100'}`}>
        <div className="flex justify-center space-x-1.5 h-16 items-center mb-8">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="wave-bar !w-[5px]" style={{ animationDelay: `${i * 0.08}s`, height: '20px' }}></div>
          ))}
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white text-center mb-6">
          Turn Music <br />
          <span className="text-green-500 neon-glow">Into Money.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 font-medium text-center mb-8 max-w-2xl">
          Listen to songs. Earn in dollars. Withdraw in naira.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm mb-12">
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <i className="fas fa-check-circle text-green-500"></i>
            <span>No skills required</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <i className="fas fa-check-circle text-green-500"></i>
            <span>No trading. No stress</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <i className="fas fa-check-circle text-green-500"></i>
            <span>Just listen and earn</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <i className="fas fa-check-circle text-green-500"></i>
            <span>Your ears work for you</span>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-md gap-4">
          <button 
            onClick={() => setView('signup')}
            className="w-full py-5 bg-green-500 text-black font-black rounded-2xl hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] transform active:scale-95"
          >
            CREATE ACCOUNT
          </button>
          <button 
            onClick={() => setView('login')}
            className="w-full py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all active:scale-95"
          >
            LOG IN
          </button>
        </div>
      </div>

      {/* Auth Section */}
      <div className={`relative z-10 transition-all duration-500 w-full max-w-md ${view === 'hero' ? 'opacity-0 translate-y-10 pointer-events-none absolute' : 'opacity-100 translate-y-0'}`}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-1 bg-green-500/30 rounded-full mb-6"></div>
          <h2 className="text-4xl font-black text-white mb-2">
            {view === 'login' ? 'Welcome Back' : 'Join the Rhythm'}
          </h2>
          <p className="text-gray-500 font-medium">
            {view === 'login' ? 'Sign in to access your earnings.' : 'Create an account to start earning today.'}
          </p>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          {/* Form Header Wave */}
          <div className="flex justify-center space-x-1 h-6 items-center mb-8 opacity-40">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="wave-bar !bg-gray-500" style={{ animationDelay: `${i * 0.1}s`, height: '10px' }}></div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-3 animate-shake">
              <i className="fas fa-exclamation-circle"></i>
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
                label="Referral Code" 
                type="text" 
                value={referral} 
                onChange={setReferral} 
                placeholder="Optional" 
                optional 
              />
            )}

            {view === 'login' && (
              <div className="flex items-center mb-6">
                <input type="checkbox" id="remember" className="accent-green-500 w-4 h-4" />
                <label htmlFor="remember" className="text-sm text-gray-500 font-medium ml-2 cursor-pointer">Remember me</label>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
                isLoading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
                  PROCESSING...
                </>
              ) : (
                view === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium mb-4">
              {view === 'login' ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button 
              onClick={() => {
                setView(view === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="text-green-500 font-black hover:text-green-400 transition-colors uppercase tracking-widest text-sm"
            >
              {view === 'login' ? 'Create Account' : 'Sign In Instead'}
            </button>
          </div>
        </div>

        <button 
          onClick={() => { setView('hero'); setError(''); }}
          className="mt-8 text-gray-600 hover:text-white transition-colors flex items-center gap-2 mx-auto font-bold text-sm"
        >
          <i className="fas fa-arrow-left"></i>
          BACK TO START
        </button>
      </div>

      <style>{`
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Welcome;
