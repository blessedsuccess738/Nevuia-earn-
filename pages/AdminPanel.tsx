
import React, { useState } from 'react';
import { User, Transaction, AppSettings, AccountStatus, TransactionStatus, PlanTier } from '../types';

interface AdminPanelProps {
  state: {
    users: User[];
    transactions: Transaction[];
    settings: AppSettings;
  };
  onUpdateSettings: (settings: AppSettings) => void;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ state, onUpdateSettings, setState }) => {
  const [exchangeRate, setExchangeRate] = useState(state.settings.usdToNgnRate.toString());
  const [minWithdrawal, setMinWithdrawal] = useState(state.settings.minWithdrawalNGN.toString());

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...state.settings,
      usdToNgnRate: parseFloat(exchangeRate),
      minWithdrawalNGN: parseFloat(minWithdrawal),
    });
    alert("Platform settings successfully updated!");
  };

  const updateTxnStatus = (txnId: string, status: TransactionStatus) => {
    const txn = state.transactions.find(t => t.id === txnId);
    if (!txn) return;

    if (txn.type === 'ACTIVATION' && status === TransactionStatus.APPROVED) {
      const requestedPlan = txn.planRequested || PlanTier.BASIC;
      
      setState((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => u.id === txn.userId ? { ...u, status: AccountStatus.ACTIVATED, plan: requestedPlan } : u),
        transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t),
        currentUser: prev.currentUser?.id === txn.userId ? { ...prev.currentUser, status: AccountStatus.ACTIVATED, plan: requestedPlan } : prev.currentUser
      }));
    } else {
      setState((prev: any) => ({
        ...prev,
        transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t)
      }));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Command Center</h1>
        <p className="text-gray-500 font-bold">Admin-only platform oversight and global configurations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass-card p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 uppercase italic">
            <i className="fas fa-cog text-green-500"></i> Global Settings
          </h2>
          <form onSubmit={handleUpdateSettings} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block ml-1">Exchange Rate (₦ / $1)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-black">₦</span>
                <input 
                  type="number" 
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-12 pr-6 py-5 focus:border-green-500 outline-none text-white font-black"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block ml-1">Min. Withdrawal (₦)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-black">₦</span>
                <input 
                  type="number" 
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-12 pr-6 py-5 focus:border-green-500 outline-none text-white font-black"
                />
              </div>
            </div>
            <button className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-green-500 transition-all uppercase tracking-widest shadow-lg active:scale-95">
              Sync Platform Settings
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 uppercase italic">
            <i className="fas fa-tasks text-blue-500"></i> Operational Queue
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
            {state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <i className="fas fa-inbox text-4xl mb-4"></i>
                <p className="font-black uppercase tracking-[0.2em] text-xs">Queue is empty</p>
              </div>
            ) : (
              state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).map(txn => {
                const user = state.users.find(u => u.id === txn.userId);
                return (
                  <div key={txn.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 transition-colors">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${txn.type === 'ACTIVATION' ? 'bg-purple-500/20 text-purple-500' : 'bg-green-500/20 text-green-500'}`}>
                          {txn.type}
                        </span>
                        <span className="text-sm font-black text-white">{user?.username}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 font-medium">{txn.details}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-white">₦{(txn.amountUSD * state.settings.usdToNgnRate).toLocaleString()}</p>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-tighter">(${txn.amountUSD.toFixed(2)})</p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button 
                        onClick={() => updateTxnStatus(txn.id, TransactionStatus.APPROVED)}
                        className="flex-grow md:flex-none bg-green-500 text-black font-black px-8 py-3 rounded-xl text-xs hover:bg-green-400 transition-all uppercase tracking-widest shadow-lg shadow-green-500/20"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => updateTxnStatus(txn.id, TransactionStatus.REJECTED)}
                        className="flex-grow md:flex-none bg-red-500/10 text-red-500 font-black px-8 py-3 rounded-xl text-xs hover:bg-red-500/20 transition-all uppercase tracking-widest border border-red-500/20"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-[3rem] border border-white/5">
        <h2 className="text-xl font-black mb-8 flex items-center gap-3 uppercase italic">
          <i className="fas fa-users text-purple-500"></i> Platform Earner Registry
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                <th className="pb-6 font-black">Earner</th>
                <th className="pb-6 font-black">Tier</th>
                <th className="pb-6 font-black">USD Balance</th>
                <th className="pb-6 font-black">Status</th>
                <th className="pb-6 font-black">Songs</th>
                <th className="pb-6 font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {state.users.map(user => (
                <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-5">
                    <div className="font-black text-white tracking-tight">{user.username}</div>
                    <div className="text-[10px] text-gray-500 font-medium">{user.email}</div>
                  </td>
                  <td className="py-5">
                    <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20">
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-5 font-black text-green-500">${user.balanceUSD.toFixed(2)}</td>
                  <td className="py-5">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                      user.status === AccountStatus.ACTIVATED ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-5 text-gray-400 font-black">{user.totalSongs}</td>
                  <td className="py-5">
                    <button className="text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors">Terminate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
