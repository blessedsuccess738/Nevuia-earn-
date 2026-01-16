
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AppSettings, Transaction, AccountStatus, TransactionStatus, PlanTier } from '../types';
import { NIGERIAN_BANKS } from '../constants';

interface WithdrawProps {
  user: User;
  settings: AppSettings;
  onTransaction: (txn: Transaction) => void;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

const Withdraw: React.FC<WithdrawProps> = ({ user, settings, onTransaction, setState }) => {
  const navigate = useNavigate();
  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const MIN_USD = settings.minWithdrawalUSD || 15.00;

  useEffect(() => {
    const verifyAccount = async () => {
      if (accountNumber.length === 10 && bankCode) {
        setIsVerifying(true);
        setIsVerified(false);
        const apiKey = settings.nubapiKey || '';
        try {
          const response = await fetch(`https://nubapi.com/api/verify?account_number=${accountNumber}&bank_code=${bankCode}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const data = await response.json();
          if (data && data.account_name) {
            setAccountName(data.account_name);
            setIsVerified(true);
          }
        } catch (error) { console.error(error); } finally { setIsVerifying(false); }
      }
    };
    const debounce = setTimeout(verifyAccount, 600);
    return () => clearTimeout(debounce);
  }, [accountNumber, bankCode, settings.nubapiKey]);

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountUSD = parseFloat(withdrawAmountUSD);
    if (!settings.isWithdrawalOpen) { setMsg({ type: 'error', text: 'Gateway Locked' }); return; }
    if (!isVerified) { setMsg({ type: 'error', text: 'Invalid Bank Details' }); return; }
    if (amountUSD < MIN_USD) { setMsg({ type: 'error', text: `Min withdrawal is $${MIN_USD}` }); return; }
    if (amountUSD > user.balanceUSD) { setMsg({ type: 'error', text: 'Insufficient balance' }); return; }

    setLoading(true);
    setTimeout(() => {
      const selectedBank = NIGERIAN_BANKS.find(b => b.code === bankCode)?.name || 'Unknown';
      const txn: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        amountUSD: amountUSD,
        type: 'WITHDRAWAL',
        status: TransactionStatus.PROCESSING,
        timestamp: new Date().toISOString(),
        details: `${selectedBank} - ${accountNumber}`
      };
      onTransaction(txn);
      const updatedUser = { ...user, balanceUSD: user.balanceUSD - amountUSD };
      setState((prev: any) => ({ ...prev, currentUser: updatedUser, users: prev.users.map((u: User) => u.id === updatedUser.id ? updatedUser : u) }));
      setLoading(false);
      setMsg({ type: 'success', text: 'Settlement initiated. Syncing with ledger...' });
      setWithdrawAmountUSD('');
      setAccountNumber('');
    }, 1500);
  };

  return (
    <div className="flex-grow pb-32 px-4 pt-6 max-w-md mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all shadow-xl"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">Settlement</h2>
      </div>

      <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
           <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Official Schedule</p>
           <p className="text-xs font-black text-green-500 uppercase italic">{settings.withdrawalSchedule || 'Available for Settlement 24/7'}</p>
        </div>

        {msg.text && (
          <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 ${msg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
            <i className={`fas ${msg.type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}`}></i>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleWithdrawal} className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center">
              <p className="text-[8px] text-gray-500 font-black mb-1 uppercase tracking-widest">Available</p>
              <p className="text-xl font-black text-white">${user.balanceUSD.toFixed(2)}</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center">
              <p className="text-[8px] text-gray-500 font-black mb-1 uppercase tracking-widest">Threshold</p>
              <p className="text-xl font-black text-white">${MIN_USD.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-2">Amount to Payout ($)</label>
            <input type="number" step="0.01" value={withdrawAmountUSD} onChange={e => setWithdrawAmountUSD(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black text-white focus:border-green-500 outline-none" placeholder="0.00" />
          </div>

          <div className="space-y-3 pt-6 border-t border-white/5">
            <select value={bankCode} onChange={e => setBankCode(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-bold h-[56px] text-xs">
              <option value="" disabled className="bg-black">Select Destination Bank</option>
              {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code} className="bg-black">{b.name}</option>)}
            </select>
            <div className="relative">
               <input type="text" maxLength={10} value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g,''))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-black tracking-[0.2em] text-xs" placeholder="ACCOUNT NUMBER" />
               {isVerifying && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>}
            </div>
            <input type="text" readOnly value={accountName} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-4 text-white font-black uppercase text-[10px]" placeholder="Account Holder Verification" />
          </div>

          <button type="submit" disabled={loading || !isVerified} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl disabled:opacity-30 active:scale-95 transition-all">
            {loading ? 'Transmitting...' : 'Initiate Withdrawal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdraw;
