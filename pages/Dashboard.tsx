
import React from 'react';
import { Link } from 'react-router-dom';
import { User, AppSettings, Transaction, AccountStatus, PlanTier } from '../types';
import { PLAN_DETAILS } from '../constants';

interface DashboardProps {
  user: User;
  settings: AppSettings;
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, settings, transactions }) => {
  const ngnBalance = user.balanceUSD * settings.usdToNgnRate;
  const ngnDaily = user.dailyEarnings * settings.usdToNgnRate;
  const userTransactions = transactions.filter(t => t.userId === user.id);
  const plan = PLAN_DETAILS[user.plan];
  const limitStr = plan.songLimit === Infinity ? 'Unlimited' : plan.songLimit.toString();
  const remainingSongs = plan.songLimit === Infinity ? '∞' : Math.max(0, plan.songLimit - user.songsListenedToday);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Welcome back, {user.username}!</h1>
          <p className="text-gray-500">Track your earnings and keep the rhythm going.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-full border border-white/10 text-xs font-black bg-white/5 flex items-center gap-2">
            <i className="fas fa-crown text-yellow-500"></i>
            PLAN: {plan.name}
          </div>
          <div className={`px-4 py-2 rounded-full border text-xs font-black flex items-center gap-2 ${
            user.status === AccountStatus.ACTIVATED ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-yellow-500 text-yellow-500 bg-yellow-500/10'
          }`}>
            <i className={`fas ${user.status === AccountStatus.ACTIVATED ? 'fa-check-circle' : 'fa-lock'}`}></i>
            {user.status === AccountStatus.ACTIVATED ? 'ACTIVATED' : 'NOT ACTIVATED'}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl border-l-4 border-green-500">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Total Wallet</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">${user.balanceUSD.toFixed(2)}</h2>
          </div>
          <p className="text-green-500 text-sm font-bold mt-2">₦{ngnBalance.toLocaleString()}</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border-l-4 border-blue-500">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Songs Left Today</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">{remainingSongs} <span className="text-gray-500 text-sm">/ {limitStr}</span></h2>
          </div>
          <p className="text-blue-500 text-sm font-bold mt-2">Resets daily</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border-l-4 border-purple-500">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Today's Earnings</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-black text-white">${user.dailyEarnings.toFixed(2)}</h2>
          </div>
          <p className="text-purple-500 text-sm font-bold mt-2">₦{ngnDaily.toLocaleString()}</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border-l-4 border-orange-500">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest">Withdrawal Status</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-black text-white">
              {user.status === AccountStatus.ACTIVATED ? 'UNLOCKED' : 'LOCKED'}
            </h2>
          </div>
          <p className="text-orange-500 text-[10px] font-bold mt-2 uppercase tracking-tight">
            {user.status === AccountStatus.ACTIVATED ? 'Withdrawals enabled' : 'Activate to withdraw'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/listen" className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-white/5 hover:border-green-500 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-play text-green-500 text-xl"></i>
          </div>
          <span className="font-bold text-sm">Listen & Earn</span>
        </Link>
        <Link to="/activation" className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-white/5 hover:border-yellow-500 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-bolt text-yellow-500 text-xl"></i>
          </div>
          <span className="font-bold text-sm">Upgrade Plan</span>
        </Link>
        <Link to="/withdraw" className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-white/5 hover:border-blue-500 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-wallet text-blue-500 text-xl"></i>
          </div>
          <span className="font-bold text-sm">Withdraw</span>
        </Link>
        <button className="flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-white/5 hover:border-purple-500 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i className="fas fa-user-plus text-purple-500 text-xl"></i>
          </div>
          <span className="font-bold text-sm">Refer Friends</span>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-3xl p-6 border border-white/5">
        <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
        {userTransactions.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-history text-gray-500"></i>
            </div>
            <p className="text-gray-500">No transactions yet. Start listening to earn!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-wider border-b border-white/5">
                  <th className="pb-4 font-black">Type</th>
                  <th className="pb-4 font-black">Amount</th>
                  <th className="pb-4 font-black">Status</th>
                  <th className="pb-4 font-black">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {userTransactions.map(txn => (
                  <tr key={txn.id} className="border-b border-white/5 last:border-0">
                    <td className="py-4 font-bold text-white uppercase text-[10px] tracking-widest">{txn.type}</td>
                    <td className="py-4 text-green-500 font-black">₦{(txn.amountUSD * settings.usdToNgnRate).toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                        txn.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' :
                        txn.status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 text-[10px]">{new Date(txn.timestamp).toLocaleDateString()}</td>
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
