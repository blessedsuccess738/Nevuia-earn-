
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

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">Hey, {user.username}!</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest leading-none mt-1">Wallet Synchronized & Secure</p>
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
      {canClaimDaily && (
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/10 border border-green-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
                 <i className="fas fa-gift text-black"></i>
              </div>
              <div>
                 <h4 className="text-white font-black text-sm uppercase italic">Daily Reward Available!</h4>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Claim your free ${settings.dailyRewardUSD} for checking in today.</p>
              </div>
           </div>
           <button 
             onClick={onClaimDaily}
             className="bg-green-500 text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl"
           >
             Claim Reward
           </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Total Payout Balance</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">${user.balanceUSD.toFixed(2)}</h2>
          </div>
          <p className="text-green-500 text-[10px] font-black mt-1">₦{ngnBalance.toLocaleString()}</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Listening Remaining</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">{remainingSongs} <span className="text-gray-500 text-sm">/ {limitStr}</span></h2>
          </div>
          <p className="text-blue-500 text-[10px] font-black mt-1 uppercase tracking-tighter italic">Resets at Midnight</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Referral Profits</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">${user.referralEarningsUSD.toFixed(2)}</h2>
          </div>
          <p className="text-purple-500 text-[10px] font-black mt-1 uppercase tracking-tighter">{user.referralsCount} People Referred</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Withdrawal Access</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-xl font-black ${settings.isWithdrawalOpen ? 'text-green-500' : 'text-red-500'}`}>
              {settings.isWithdrawalOpen ? 'OPEN' : 'CLOSED'}
            </h2>
          </div>
          <p className="text-gray-500 text-[9px] font-bold mt-1 uppercase leading-tight italic">
            {settings.withdrawalSchedule}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/listen" className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-white/5 hover:border-green-500 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <i className="fas fa-play text-green-500 text-lg"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">Earn Music</span>
        </Link>
        <Link to="/activation" className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-white/5 hover:border-yellow-500 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <i className="fas fa-bolt text-yellow-500 text-lg"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">Activation</span>
        </Link>
        <Link to="/withdraw" className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-white/5 hover:border-blue-500 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <i className="fas fa-wallet text-blue-500 text-lg"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">Withdraw</span>
        </Link>
        <div className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-white/5 hover:border-purple-500 transition-all group cursor-pointer" onClick={() => {
            navigator.clipboard.writeText(user.referralCode);
            alert(`Your referral code ${user.referralCode} copied!`);
        }}>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <i className="fas fa-share-alt text-purple-500 text-lg"></i>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">Share Ref</span>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-white/5">
        <h3 className="text-xl font-black italic uppercase mb-6">Ledger Activity</h3>
        {userTransactions.length === 0 ? (
          <div className="text-center py-10 opacity-30 italic">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No recent movement detected.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[9px] uppercase tracking-[0.2em] border-b border-white/5 font-black">
                  <th className="pb-4">Category</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-black">
                {userTransactions.map(txn => (
                  <tr key={txn.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="py-4 font-bold text-white uppercase tracking-widest italic">{txn.type}</td>
                    <td className="py-4 text-green-500">+${txn.amountUSD.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        txn.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' :
                        txn.status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500">{new Date(txn.timestamp).toLocaleDateString()}</td>
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
