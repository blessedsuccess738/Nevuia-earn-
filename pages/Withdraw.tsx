
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

  const plan = PLAN_DETAILS[user.plan];
  const isActivated = user.status === AccountStatus.ACTIVATED;
  const isIndividualOpen = user.withdrawalEnabled !== false;
  const withdrawAmountNGN = parseFloat(withdrawAmountUSD) * settings.usdToNgnRate || 0;

  useEffect(() => {
    const verifyAccount = async () => {
      if (accountNumber.length === 10 && bankCode) {
        setIsVerifying(true);
        setIsVerified(false);
        setAccountName('');
        
        const apiKey = settings.nubapiKey || process.env.API_KEY;

        try {
          const response = await fetch(`https://nubapi.com/api/verify?account_number=${accountNumber}&bank_code=${bankCode}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          
          if (data && data.account_name) {
            setAccountName(data.account_name);
            setIsVerified(true);
            setMsg({ type: 'success', text: 'Account verified successfully!' });
          } else {
            setMsg({ type: 'error', text: data.message || 'Verification failed. Please check details.' });
          }
        } catch (error) {
          console.error("Verification Error:", error);
          setMsg({ type: 'error', text: 'Network error during verification.' });
        } finally {
          setIsVerifying(false);
        }
      }
    };

    const debounce = setTimeout(verifyAccount, 500);
    return () => clearTimeout(debounce);
  }, [accountNumber, bankCode, settings.nubapiKey]);

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountUSD = parseFloat(withdrawAmountUSD);
    
    if (!settings.isWithdrawalOpen) {
      setMsg({ type: 'error', text: `Portal Closed: ${settings.withdrawalSchedule}` });
      return;
    }

    if (!isVerified) {
      setMsg({ type: 'error', text: 'Please verify your bank account details first.' });
      return;
    }

    if (amountUSD * settings.usdToNgnRate < settings.minWithdrawalNGN) {
      setMsg({ type: 'error', text: `Minimum withdrawal is ₦${settings.minWithdrawalNGN.toLocaleString()}.` });
      return;
    }

    if (amountUSD > user.balanceUSD) {
      setMsg({ type: 'error', text: 'Insufficient balance.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const selectedBank = NIGERIAN_BANKS.find(b => b.code === bankCode)?.name || 'Unknown Bank';
      const txn: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        amountUSD: amountUSD,
        type: 'WITHDRAWAL',
        status: TransactionStatus.PROCESSING,
        timestamp: new Date().toISOString(),
        details: `${selectedBank} - ${accountNumber} (${accountName})`
      };
      
      onTransaction(txn);

      const updatedUser = { ...user, balanceUSD: user.balanceUSD - amountUSD };
      setState((prev: any) => ({
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map((u: User) => u.id === updatedUser.id ? updatedUser : u)
      }));

      setLoading(false);
      setMsg({ type: 'success', text: 'Withdrawal submitted. Payout in progress.' });
      setWithdrawAmountUSD('');
      setAccountNumber('');
      setIsVerified(false);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
      <div className="glass-card p-10 md:p-14 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border ${
             settings.isWithdrawalOpen && isIndividualOpen ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
           }`}>
             Portal: {settings.isWithdrawalOpen && isIndividualOpen ? 'Open' : 'Closed'}
           </span>
        </div>

        <h2 className="text-4xl font-black mb-2 uppercase italic tracking-tighter">Withdraw Funds</h2>
        <p className="text-gray-500 mb-12 font-medium">Local Nigerian bank settlement enabled.</p>

        {!isActivated && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <i className="fas fa-lock text-yellow-500 text-2xl"></i>
                <div>
                   <h4 className="text-white font-black text-sm uppercase">Activation Needed</h4>
                   <p className="text-xs text-gray-500 font-medium tracking-tight">Standard or Premium plan required.</p>
                </div>
             </div>
             <button onClick={() => navigate('/activation')} className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase">Activate</button>
          </div>
        )}

        {msg.text && (
          <div className={`p-5 rounded-2xl mb-8 flex items-center gap-4 animate-in fade-in duration-300 ${msg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
            <i className={`fas ${msg.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'} text-lg`}></i>
            <span className="text-sm font-black uppercase tracking-tight">{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleWithdrawal} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-[10px] text-gray-500 font-black mb-1 uppercase tracking-widest">Available</p>
              <p className="text-2xl font-black text-white">${user.balanceUSD.toFixed(2)}</p>
              <p className="text-green-500 text-xs font-bold">₦{(user.balanceUSD * settings.usdToNgnRate).toLocaleString()}</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-[10px] text-gray-500 font-black mb-1 uppercase tracking-widest">Rate</p>
              <p className="text-xl font-black text-white">₦{settings.usdToNgnRate.toLocaleString()}/$</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Withdraw Amount ($)</label>
            <input 
              type="number" 
              required
              value={withdrawAmountUSD}
              onChange={(e) => setWithdrawAmountUSD(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-[2rem] px-8 py-6 focus:outline-none focus:border-green-500 text-white text-2xl font-black transition-all" 
              placeholder="0.00"
            />
          </div>

          <div className="space-y-6 pt-8 border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-[9px] text-gray-600 uppercase font-black ml-1">Bank</label>
                  <select 
                    value={bankCode} 
                    onChange={e => setBankCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-green-500 text-white font-bold h-[54px]"
                  >
                    <option value="" disabled className="bg-black">Select Bank</option>
                    {NIGERIAN_BANKS.map(bank => (
                      <option key={bank.code} value={bank.code} className="bg-black">{bank.name}</option>
                    ))}
                  </select>
               </div>

               <div className="space-y-1">
                  <label className="text-[9px] text-gray-600 uppercase font-black ml-1">Account Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      maxLength={10}
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-green-500 text-white font-black tracking-widest" 
                      placeholder="0123456789"
                    />
                    {isVerifying && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>}
                  </div>
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-[9px] text-gray-600 uppercase font-black ml-1">Verified Name</label>
               <div className="relative">
                 <input 
                   type="text" 
                   readOnly
                   value={accountName}
                   className={`w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black uppercase italic ${isVerified ? 'border-green-500/50 bg-green-500/5' : ''}`} 
                   placeholder="Verification Required"
                 />
                 {isVerified && <i className="fas fa-check-circle absolute right-4 top-1/2 -translate-y-1/2 text-green-500"></i>}
               </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || !isVerified || !isActivated || !settings.isWithdrawalOpen}
            className={`w-full py-6 rounded-[2rem] font-black transition-all uppercase tracking-widest text-lg ${
              loading || !isVerified || !isActivated || !settings.isWithdrawalOpen 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-green-500 text-black hover:bg-green-400 shadow-xl'
            }`}
          >
            {loading ? 'Processing...' : 'Settle Funds'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdraw;
