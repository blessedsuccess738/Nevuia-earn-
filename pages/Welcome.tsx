
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WelcomeProps {
  onLogin: (email: string) => boolean;
  onRegister: (username: string, email: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      if (onLogin(email)) {
        navigate('/dashboard');
      } else {
        setError('User not found. Please register.');
      }
    } else {
      if (!username || !email) {
        setError('Please fill all fields.');
        return;
      }
      onRegister(username, email);
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-900/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-4xl space-y-8">
        <div className="flex justify-center space-x-1 h-12 items-center mb-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-none text-white">
          Turn Every <span className="text-green-500 neon-glow">Beat</span> Into <span className="text-green-500">Dollars</span>.
        </h1>

        <p className="text-lg md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
          Your Time. Your Ears. Real Rewards. Listen to Music. Earn in USD. Withdraw in Naira. 
          Powered by Secure Systems and Smart Anti-Fraud Technology.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button 
            onClick={() => { setIsRegister(true); setIsLogin(false); }}
            className="w-full sm:w-auto px-10 py-4 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all transform hover:scale-105"
          >
            Start Earning Now
          </button>
          <button 
            onClick={() => { setIsLogin(true); setIsRegister(false); }}
            className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-all"
          >
            Sign In to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <i className="fas fa-shield-alt text-green-500 text-2xl mb-4"></i>
            <h3 className="text-lg font-bold text-white mb-2">Secure Payouts</h3>
            <p className="text-gray-500 text-sm">Verified withdrawal system with multi-layer encryption.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <i className="fas fa-bolt text-green-500 text-2xl mb-4"></i>
            <h3 className="text-lg font-bold text-white mb-2">Instant Earnings</h3>
            <p className="text-gray-500 text-sm">Watch your balance grow with every second of rhythm.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <i className="fas fa-users text-green-500 text-2xl mb-4"></i>
            <h3 className="text-lg font-bold text-white mb-2">Referral Program</h3>
            <p className="text-gray-500 text-sm">Earn commissions when friends join the music revolution.</p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {(isLogin || isRegister) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-green-500/30 relative">
            <button 
              onClick={() => { setIsLogin(false); setIsRegister(false); }}
              className="absolute top-6 right-6 text-gray-500 hover:text-white"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-2xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-gray-500 mb-6 text-sm">{isLogin ? 'Enter your details to access your earnings.' : 'Start your music earning journey today.'}</p>
            
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">{error}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold ml-1">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 text-white" 
                    placeholder="JohnDoe"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 text-white" 
                  placeholder="name@example.com"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-green-500 text-black font-bold py-4 rounded-xl hover:bg-green-400 transition-all"
              >
                {isLogin ? 'Sign In' : 'Join Now'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;
