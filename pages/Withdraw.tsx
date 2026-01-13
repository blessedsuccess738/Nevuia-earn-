
import React, { useState } from 'react';
import { User, AppSettings, Transaction, AccountStatus, TransactionStatus } from '../types';

interface WithdrawProps {
  user: User;
  settings: AppSettings;
  onTransaction: (txn: Transaction) => void;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

const Withdraw: React.FC<WithdrawProps> = ({ user, settings, onTransaction, setState }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleActivation = () => {
    setLoading(true);
    setTimeout(() => {
      const txn: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        amountUSD: settings.activationFeeUSD,
        type: 'ACTIVATION',
        status: TransactionStatus.PROCESSING,
        timestamp: new Date().toISOString(),
        details: 'Activation Fee'
      };
      
      onTransaction(txn);
      
      const updatedUser = { ...user, status: AccountStatus.PENDING_ACTIVATION };
      setState((prev: any) => ({
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map((u: User) => u.id === updatedUser.id ? updatedUser : u)
      }));
      
      setLoading(false);
      setMsg({ type: 'success', text: 'Activation request submitted! Please wait for admin approval.' });
    }, 1500);
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (user.status !== AccountStatus.ACTIVATED) {
      setMsg({ type: 'error', text: 'You must activate your account before withdrawing.' });
      return;
    }
    
    if (amount < settings.minWithdrawalUSD) {
      setMsg({ type: 'error', text: `Minimum withdrawal is $${settings.minWithdrawalUSD}.` });
      return;
    }

    if (amount > user.balanceUSD) {
      setMsg({ type: 'error', text: 'Insufficient balance.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const txn: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        amountUSD: amount,
        type: 'WITHDRAWAL',
        status: TransactionStatus.PROCESSING,
        timestamp: new Date().toISOString(),
        details: `${bankName} - ${accountNumber}`
      };
      
      onTransaction(txn);

      const updatedUser = { ...user, balanceUSD: user.balanceUSD - amount };
      setState((prev: any) => ({
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map((u: User) => u.id === updatedUser.id ? updatedUser : u)
      }));

      setLoading(false);
      setMsg({ type: 'success', text: 'Withdrawal request submitted for processing.' });
      setWithdrawAmount('');
    }, 1500);
  };

  if (user.status !== AccountStatus.ACTIVATED) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-12 text-center">
        <div className="glass-card p-10 rounded-[2.5rem] border border-yellow-500/30">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-lock text-yellow-500 text-3xl"></i>
          </div>
          <h2 className="text-3xl font-black mb-4">Unlock Withdrawals</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Your account is currently not activated. You can continue earning by listening to music, 
            but to withdraw your funds, a one-time activation is required.
          </p>
          
          <div className="bg-white/5 rounded-2xl p-6 mb-8 flex items-center justify-between border border-white/5">
            <div className="text-left">
              <p className="text-xs text-gray-500 font-bold uppercase">Activation Fee</p>
              <p className="text-2xl font-black text-white">${settings.activationFeeUSD.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-bold uppercase">Naira Equivalent</p>
              <p className="text-xl font-bold text-green-500">₦{(settings.activationFeeUSD * settings.usdToNgnRate).toLocaleString()}</p>
            </div>
          </div>

          {user.status === AccountStatus.PENDING_ACTIVATION ? (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-500 font-bold">
              <i className="fas fa-clock mr-2"></i> Activation Pending Admin Review
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={() => setIsActivating(true)}
                className="w-full bg-green-500 text-black font-black py-4 rounded-xl hover:bg-green-400 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-bolt"></i>
                ACTIVATE ACCOUNT NOW
              </button>
              <p className="text-gray-500 text-xs font-medium">Payment options: Manual Bank Transfer, USDT</p>
            </div>
          )}
        </div>

        {isActivating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-green-500/50 relative">
              <button onClick={() => setIsActivating(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
              <h3 className="text-2xl font-black mb-4">Payment Details</h3>
              <div className="space-y-6 text-left">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 font-bold mb-1">BANK TRANSFER (NGN)</p>
                  <p className="text-sm font-bold text-white">Bank: NeoBank Digital</p>
                  <p className="text-sm font-bold text-white">Account: 0123456789</p>
                  <p className="text-sm font-bold text-white">Name: BeatBucks Admin</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 font-bold mb-1">USDT (BEP20/ERC20)</p>
                  <p className="text-xs font-mono text-white break-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</p>
                </div>
                <p className="text-xs text-gray-400 italic">Send exactly ${settings.activationFeeUSD} and click confirm below. Admin will verify your payment.</p>
                <button 
                  onClick={handleActivation}
                  disabled={loading}
                  className="w-full bg-green-500 text-black font-black py-4 rounded-xl hover:bg-green-400 transition-all"
                >
                  {loading ? 'Submitting...' : 'CONFIRM PAYMENT SENT'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-12">
      <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <h2 className="text-3xl font-black mb-2">Withdraw Earnings</h2>
        <p className="text-gray-500 mb-8">Cash out your hard-earned USD directly to your local bank account.</p>

        {msg.text && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${msg.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
            <i className={`fas ${msg.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
            <span className="text-sm font-bold">{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleWithdrawal} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-500 font-bold mb-1 uppercase">Available</p>
              <p className="text-xl font-black text-white">${user.balanceUSD.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-500 font-bold mb-1 uppercase">Min. Cashout</p>
              <p className="text-xl font-black text-white">${settings.minWithdrawalUSD}</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase font-bold ml-1">Withdrawal Amount (USD)</label>
            <input 
              type="number" 
              required
              min={settings.minWithdrawalUSD}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-green-500 text-white text-lg font-bold" 
              placeholder="0.00"
            />
            {withdrawAmount && (
              <p className="text-green-500 text-xs font-bold mt-2 ml-1">
                You will receive: ₦{(parseFloat(withdrawAmount) * settings.usdToNgnRate).toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <label className="text-xs text-gray-500 uppercase font-bold ml-1">Bank Name</label>
              <input 
                type="text" 
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 text-white" 
                placeholder="e.g. Zenith Bank"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-bold ml-1">Account Number</label>
              <input 
                type="text" 
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 text-white" 
                placeholder="0123456789"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-bold ml-1">Account Holder Name</label>
              <input 
                type="text" 
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 text-white" 
                placeholder="John Doe"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-black font-black py-5 rounded-2xl hover:bg-green-400 transition-all shadow-xl shadow-green-500/20"
          >
            {loading ? 'Processing Transaction...' : 'REQUEST WITHDRAWAL'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdraw;
