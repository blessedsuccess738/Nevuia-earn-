
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AppSettings, Transaction, AccountStatus, TransactionStatus, PlanTier } from '../types';
import { PLAN_DETAILS, NIGERIAN_BANKS } from '../constants';

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
    if (!settings.isWithdrawalOpen) { setMsg({ type: 'error', text: 'Portal Closed' }); return; }
    if (!isVerified) { setMsg({ type: 'error', text: 'Verify bank details' }); return; }
    if (amountUSD < MIN_USD) { setMsg({ type: 'error', text: `Min $${MIN_USD}` }); return; }
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
      setMsg({ type: 'success', text: 'Payout request initiated' });
      setWithdrawAmountUSD('');
      setAccountNumber('');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-12 animate-in fade-in duration-500 pb-32">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/10 active:scale-90 transition-all shadow-xl"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Settle Funds</h2>
      </div>

      <div className="glass-card p-10 md:p-14 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           <span className={`text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest border ${
             settings.isWithdrawalOpen ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
           }`}>
             GATEWAY: {settings.isWithdrawalOpen ? 'OPEN' : 'LOCKED'}
           </span>
        </div>

        <h3 className="text-4xl font-black mb-10 uppercase italic tracking-tighter text-white">Liquidity Out</h3>

        {msg.text && (
          <div className={`p-5 rounded-2xl mb-10 flex items-center gap-4 ${msg.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
            <i className={`fas ${msg.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleWithdrawal} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center">
              <p className="text-[9px] text-gray-500 font-black mb-2 uppercase tracking-widest">Available</p>
              <p className="text-3xl font-black text-white">${user.balanceUSD.toFixed(2)}</p>
            </div>
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center">
              <p className="text-[9px] text-gray-500 font-black mb-2 uppercase tracking-widest">Min Req</p>
              <p className="text-3xl font-black text-white">${MIN_USD.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-4">Withdraw Amount ($)</label>
            <input type="number" step="0.01" value={withdrawAmountUSD} onChange={e => setWithdrawAmountUSD(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-[2.5rem] px-10 py-8 text-4xl font-black text-white focus:border-green-500 outline-none transition-all shadow-inner" placeholder="0.00" />
          </div>

          <div className="space-y-4 pt-10 border-t border-white/5">
            <select value={bankCode} onChange={e => setBankCode(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold h-[64px] appearance-none cursor-pointer">
              <option value="" disabled className="bg-black">Select Destination Bank</option>
              {NIGERIAN_BANKS.map(b => <option key={b.code} value={b.code} className="bg-black">{b.name}</option>)}
            </select>
            <div className="relative">
               <input type="text" maxLength={10} value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g,''))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-black tracking-[0.3em]" placeholder="0000000000" />
               {isVerifying && <div className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>}
            </div>
            <input type="text" readOnly value={accountName} className="w-full bg-white/10 border border-white/10 rounded-2xl px-6 py-5 text-white font-black uppercase italic text-xs" placeholder="Receiver Verification Name" />
          </div>

          <button type="submit" disabled={loading || !isVerified} className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:bg-green-500 transition-all active:scale-95 disabled:opacity-30">
            {loading ? 'Transmitting...' : 'Process Settlement'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdraw;
