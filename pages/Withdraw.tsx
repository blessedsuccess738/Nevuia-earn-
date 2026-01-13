
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AppSettings, Transaction, AccountStatus, TransactionStatus, PlanTier } from '../types';
import { PLAN_DETAILS } from '../constants';

interface WithdrawProps {
  user: User;
  settings: AppSettings;
  onTransaction: (txn: Transaction) => void;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

const Withdraw: React.FC<WithdrawProps> = ({ user, settings, onTransaction, setState }) => {
  const navigate = useNavigate();
  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const plan = PLAN_DETAILS[user.plan];
  const canWithdraw = plan.canWithdraw && user.status === AccountStatus.ACTIVATED;
  const withdrawAmountNGN = parseFloat(withdrawAmountUSD) * settings.usdToNgnRate || 0;

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountUSD = parseFloat(withdrawAmountUSD);
    const amountNGN = amountUSD * settings.usdToNgnRate;
    
    if (!canWithdraw) {
      setMsg({ type: 'error', text: 'You must activate a premium plan before withdrawing.' });
      return;
    }
    
    if (amountNGN < settings.minWithdrawalNGN) {
      setMsg({ type: 'error', text: `Minimum withdrawal is ₦${settings.minWithdrawalNGN.toLocaleString()}.` });
      return;
    }

    if (amountUSD > user.balanceUSD) {
      setMsg({ type: 'error', text: 'Insufficient balance.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const txn: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        amountUSD: amountUSD,
        type: 'WITHDRAWAL',
        status: TransactionStatus.PROCESSING,
        timestamp: new Date().toISOString(),
        details: `${bankName} - ${accountNumber} (${accountName})`
      };
      
      onTransaction(txn);

      const updatedUser = { ...user, balanceUSD: user.balanceUSD - amountUSD };
      setState((prev: any) => ({
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map((u: User) => u.id === updatedUser.id ? updatedUser : u)
      }));

      setLoading(false);
      setMsg({ type: 'success', text: 'Withdrawal request submitted for processing.' });
      setWithdrawAmountUSD('');
    }, 1500);
  };

  if (!canWithdraw) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-12 text-center">
        <div className="glass-card p-12 rounded-[3.5rem] border border-yellow-500/20">
          <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <i className="fas fa-lock text-yellow-500 text-4xl"></i>
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">Withdrawals Locked</h2>
          <p className="text-gray-400 mb-10 leading-relaxed font-medium">
            Free users can earn rewards but cannot withdraw funds. To unlock withdrawals and enjoy higher limits, please activate a professional plan.
          </p>
          
          <button 
            onClick={() => navigate('/activation')}
            className="w-full bg-green-500 text-black font-black py-5 rounded-2xl hover:bg-green-400 transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-xl shadow-green-500/20"
          >
            <i className="fas fa-bolt"></i>
            Activate to Withdraw
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12">
      <div className="glass-card p-10 md:p-14 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-green-500/20">
             Plan: {plan.name}
           </span>
        </div>

        <h2 className="text-4xl font-black mb-2 uppercase italic tracking-tighter">Cash Out</h2>
        <p className="text-gray-500 mb-12 font-medium">Securely withdraw your earnings to your local bank account.</p>

        {msg.text && (
          <div className={`p-5 rounded-2xl mb-8 flex items-center gap-4 animate-in fade-in duration-300 ${msg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
            <i className={`fas ${msg.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'} text-lg`}></i>
            <span className="text-sm font-black uppercase tracking-tight">{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleWithdrawal} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-[10px] text-gray-500 font-black mb-1 uppercase tracking-widest">Available Balance</p>
              <p className="text-2xl font-black text-white">${user.balanceUSD.toFixed(2)}</p>
              <p className="text-green-500 text-xs font-bold">₦{(user.balanceUSD * settings.usdToNgnRate).toLocaleString()}</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-[10px] text-gray-500 font-black mb-1 uppercase tracking-widest">Min. Withdrawal</p>
              <p className="text-2xl font-black text-white">₦{settings.minWithdrawalNGN.toLocaleString()}</p>
              <p className="text-gray-500 text-xs font-bold">≈ ${(settings.minWithdrawalNGN / settings.usdToNgnRate).toFixed(2)} USD</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Withdrawal Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-black text-xl">$</span>
              <input 
                type="number" 
                required
                step="0.01"
                min={settings.minWithdrawalNGN / settings.usdToNgnRate}
                value={withdrawAmountUSD}
                onChange={(e) => setWithdrawAmountUSD(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-[2rem] pl-12 pr-6 py-6 focus:outline-none focus:border-green-500 text-white text-2xl font-black transition-all" 
                placeholder="0.00"
              />
            </div>
            {withdrawAmountUSD && (
              <div className="bg-green-500/5 p-4 rounded-2xl border border-green-500/10 flex justify-between items-center">
                <span className="text-[10px] text-green-500 font-black uppercase">Net Payout (NGN)</span>
                <span className="text-xl font-black text-white">₦{withdrawAmountNGN.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-8 border-t border-white/5">
            <h4 className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-4">Bank Account Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <input 
                    type="text" 
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-green-500 text-white font-medium" 
                    placeholder="Bank Name"
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-green-500 text-white font-medium" 
                    placeholder="Account Number"
                  />
                </div>
            </div>
            <input 
              type="text" 
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-green-500 text-white font-medium" 
              placeholder="Account Holder Full Name"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-black font-black py-6 rounded-[2rem] hover:bg-green-400 transition-all shadow-2xl shadow-green-500/20 uppercase tracking-[0.2em] text-lg active:scale-95"
          >
            {loading ? (
               <div className="flex items-center justify-center gap-3">
                 <div className="w-5 h-5 border-4 border-black/30 border-t-black rounded-full animate-spin"></div>
                 Processing...
               </div>
            ) : 'Submit Withdrawal'}
          </button>
          
          <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            Withdrawals are processed within 24 hours of request.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Withdraw;
