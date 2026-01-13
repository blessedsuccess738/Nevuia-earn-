
import React, { useState } from 'react';
import { User, Transaction, AppSettings, AccountStatus, TransactionStatus } from '../types';

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
  const [dailyCap, setDailyCap] = useState(state.settings.dailyCapUSD.toString());

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...state.settings,
      usdToNgnRate: parseFloat(exchangeRate),
      dailyCapUSD: parseFloat(dailyCap),
    });
    alert("Settings updated successfully!");
  };

  const updateTxnStatus = (txnId: string, status: TransactionStatus) => {
    const txn = state.transactions.find(t => t.id === txnId);
    if (!txn) return;

    // If activation is approved, update user status
    if (txn.type === 'ACTIVATION' && status === TransactionStatus.APPROVED) {
      setState((prev: any) => ({
        ...prev,
        users: prev.users.map((u: User) => u.id === txn.userId ? { ...u, status: AccountStatus.ACTIVATED } : u),
        transactions: prev.transactions.map((t: Transaction) => t.id === txnId ? { ...t, status } : t),
        currentUser: prev.currentUser?.id === txn.userId ? { ...prev.currentUser, status: AccountStatus.ACTIVATED } : prev.currentUser
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
        <h1 className="text-4xl font-black uppercase tracking-tighter">Command Center</h1>
        <p className="text-gray-500 font-bold">Platform Oversight & Financial Management</p>
      </header>

      {/* Global Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass-card p-8 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-cog text-green-500"></i> Platform Settings
          </h2>
          <form onSubmit={handleUpdateSettings} className="space-y-6">
            <div>
              <label className="text-xs text-gray-500 font-black uppercase block mb-2">Exchange Rate (1 USD to NGN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</span>
                <input 
                  type="number" 
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-4 focus:border-green-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-black uppercase block mb-2">Daily Earning Cap (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={dailyCap}
                  onChange={(e) => setDailyCap(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-4 focus:border-green-500 outline-none"
                />
              </div>
            </div>
            <button className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 transition-all">
              Save Configuration
            </button>
          </form>
        </div>

        {/* Pending Requests */}
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-tasks text-blue-500"></i> Pending Requests
          </h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).length === 0 ? (
              <p className="text-gray-500 text-center py-10">No pending requests at this time.</p>
            ) : (
              state.transactions.filter(t => t.status === TransactionStatus.PROCESSING).map(txn => {
                const user = state.users.find(u => u.id === txn.userId);
                return (
                  <div key={txn.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${txn.type === 'ACTIVATION' ? 'bg-purple-500/20 text-purple-500' : 'bg-green-500/20 text-green-500'}`}>
                          {txn.type}
                        </span>
                        <span className="text-sm font-bold text-white">{user?.username}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{txn.details}</p>
                      <p className="text-lg font-black text-white">${txn.amountUSD.toFixed(2)} <span className="text-gray-500 text-xs font-bold">/ ₦{(txn.amountUSD * state.settings.usdToNgnRate).toLocaleString()}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateTxnStatus(txn.id, TransactionStatus.APPROVED)}
                        className="bg-green-500 text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-green-400"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => updateTxnStatus(txn.id, TransactionStatus.REJECTED)}
                        className="bg-red-500/20 text-red-500 font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-500/40"
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

      {/* User Management */}
      <div className="glass-card p-8 rounded-3xl border border-white/5">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <i className="fas fa-users text-purple-500"></i> Registered Users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="pb-4">User</th>
                <th className="pb-4">Balance</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Songs</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {state.users.map(user => (
                <tr key={user.id} className="border-b border-white/5 last:border-0">
                  <td className="py-4">
                    <div className="font-bold text-white">{user.username}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="py-4 font-bold text-green-500">${user.balanceUSD.toFixed(2)}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                      user.status === AccountStatus.ACTIVATED ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 text-gray-400 font-bold">{user.totalSongs}</td>
                  <td className="py-4">
                    <button className="text-red-500 hover:text-red-400 text-xs font-bold">BAN USER</button>
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
