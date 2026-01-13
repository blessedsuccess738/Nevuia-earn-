
import React from 'react';
import { Link } from 'react-router-dom';
import { User, AppSettings, Transaction, AccountStatus, PlanTier } from '../types';
import { PLAN_DETAILS } from '../constants';

interface DashboardProps {
  user: User;
  settings: AppSettings;
  transactions: Transaction[];
  onClaimDaily: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, settings, transactions, onClaimDaily }) => {
  const ngnBalance = user.balanceUSD * settings.usdToNgnRate;
  const userTransactions = transactions.filter(t => t.userId === user.id);
  const plan = PLAN_DETAILS[user.plan];
  const limitStr = plan.songLimit === Infinity ? 'Unlimited' : plan.songLimit.toString();
  const remainingSongs = plan.songLimit === Infinity ? '∞' : Math.max(0, plan.songLimit - user.songsListenedToday);
  
  const today = new Date().toDateString();
  const canClaimDaily = user.lastDailyRewardClaimed !== today;

  if (settings.maintenanceMode && user.email !== 'blessedsuccess738@gmail.com') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
         <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-8 text-yellow-500 text-4xl border border-yellow-500/20">
            <i className="fas fa-tools"></i>
         </div>
         <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Under Maintenance</h1>
         <p className="text-gray-500 max-w-md mx-auto uppercase text-[10px] font-black tracking-widest leading-loose">
            The platform is currently undergoing scheduled optimization. All balances are safe and secure. Please check back in a few hours.
         </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24 relative">
      
      {/* Live Support Floating Button */}
      <a 
        href={settings.whatsappLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[60] group"
      >
        <div className="absolute -top-12 right-0 bg-green-500 text-black text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          Chat Live Admin
        </div>
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-black text-2xl shadow-[0_10px_40px_rgba(34,197,94,0.5)] hover:scale-110 active:scale-90 transition-all">
          <i className="fab fa-whatsapp"></i>
        </div>
      </a>

      {/* Global Announcement Ticker */}
      {settings.announcement && (
        <div className="relative overflow-hidden bg-white/5 border border-white/5 rounded-2xl py-3 px-6 group">
          <div className="flex items-center gap-4">
            <span className="flex-shrink-0 text-[10px] font-black bg-green-500 text-black px-2 py-0.5 rounded uppercase tracking-widest">News</span>
            <p className="text-xs font-bold text-gray-300 uppercase tracking-tight whitespace-nowrap animate-pulse">
              {settings.announcement}
            </p>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Hello, {user.username}</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest leading-none mt-2">Verified Network Earner</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black bg-white/5 flex items-center gap-2">
            <i className="fas fa-crown text-yellow-500"></i>
            {plan.name}
          </div>
          <div className={`px-4 py-2 rounded-xl border text-[10px] font-black flex items-center gap-2 ${
            user.status === AccountStatus.ACTIVATED ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
          }`}>
            <i className={`fas ${user.status === AccountStatus.ACTIVATED ? 'fa-check-circle' : 'fa-lock'}`}></i>
            {user.status === AccountStatus.ACTIVATED ? 'ACTIVE' : 'LOCKED'}
          </div>
        </div>
      </header>

      {/* Daily Reward Banner */}
      {canClaimDaily && !settings.maintenanceMode && (
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/10 border border-green-500/20 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                 <i className="fas fa-gift text-black text-xl"></i>
              </div>
              <div>
                 <h4 className="text-white font-black text-sm uppercase italic">Loyalty Reward Ready</h4>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Claim your daily check-in bonus of ${settings.dailyRewardUSD}.</p>
              </div>
           </div>
           <button 
             onClick={onClaimDaily}
             className="bg-green-500 text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-green-500/20"
           >
             Redeem Now
           </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-[2rem] border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Available Payout</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">${user.balanceUSD.toFixed(2)}</h2>
          </div>
          <p className="text-green-500 text-[10px] font-black mt-1 uppercase italic">≈ ₦{ngnBalance.toLocaleString()}</p>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Listening Limit</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">{remainingSongs} <span className="text-gray-500 text-sm">/ {limitStr}</span></h2>
          </div>
          <p className="text-blue-500 text-[10px] font-black mt-1 uppercase tracking-widest italic leading-none">Refreshes in 24h</p>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Referral Yield</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">${user.referralEarningsUSD.toFixed(2)}</h2>
          </div>
          <p className="text-purple-500 text-[10px] font-black mt-1 uppercase tracking-widest italic">{user.referralsCount} Verified Signups</p>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Gateway Status</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-xl font-black ${settings.isWithdrawalOpen ? 'text-green-500' : 'text-red-500'}`}>
              {settings.isWithdrawalOpen ? 'OPEN' : 'LOCKED'}
            </h2>
          </div>
          <p className="text-gray-500 text-[9px] font-bold mt-1 uppercase leading-tight italic">
            {settings.withdrawalSchedule}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/listen" className="flex flex-col items-center justify-center p-8 glass-card rounded-3xl border border-white/5 hover:border-green-500/50 hover:bg-green-500/5 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-play text-green-500 text-xl"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white">Earn Audio</span>
        </Link>
        <Link to="/activation" className="flex flex-col items-center justify-center p-8 glass-card rounded-3xl border border-white/5 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-bolt text-yellow-500 text-xl"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white">Upgrade Plan</span>
        </Link>
        <Link to="/withdraw" className="flex flex-col items-center justify-center p-8 glass-card rounded-3xl border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-wallet text-blue-500 text-xl"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white">Payout Hub</span>
        </Link>
        <div className="flex flex-col items-center justify-center p-8 glass-card rounded-3xl border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group cursor-pointer" onClick={() => {
            navigator.clipboard.writeText(user.referralCode);
            alert(`Your referral code ${user.referralCode} copied!`);
        }}>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-share-alt text-purple-500 text-xl"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white">Copy Invite</span>
        </div>
      </div>

      <div className="glass-card rounded-[3rem] p-8 border border-white/5">
        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Transaction Log</h3>
        {userTransactions.length === 0 ? (
          <div className="text-center py-20 opacity-30 italic">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No ledger entries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 text-[9px] uppercase tracking-[0.3em] border-b border-white/5 font-black">
                  <th className="pb-6">Movement</th>
                  <th className="pb-6">Value</th>
                  <th className="pb-6">Status</th>
                  <th className="pb-6">Finalized</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-black">
                {userTransactions.map(txn => (
                  <tr key={txn.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="py-6 text-white uppercase tracking-tighter italic">{txn.type}</td>
                    <td className="py-6 text-green-500 font-bold">+${txn.amountUSD.toFixed(2)}</td>
                    <td className="py-6">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        txn.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        txn.status === 'PROCESSING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-6 text-gray-500 tracking-widest uppercase">{new Date(txn.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
