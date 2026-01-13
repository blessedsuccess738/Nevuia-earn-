
import React, { useState } from 'react';
import { User, AppSettings, Transaction, AccountStatus, PlanTier, TransactionStatus } from '../types';
import { PLAN_DETAILS } from '../constants';

interface ActivationProps {
  user: User;
  settings: AppSettings;
  onTransaction: (txn: Transaction) => void;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

const Activation: React.FC<ActivationProps> = ({ user, settings, onTransaction, setState }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlanSelect = (tier: PlanTier) => {
    if (tier === PlanTier.FREE) return;
    if (user.plan === tier) return;
    setSelectedPlan(tier);
    setIsPaying(true);
  };

  const confirmPayment = () => {
    if (!selectedPlan) return;
    setLoading(true);
    
    const planInfo = PLAN_DETAILS[selectedPlan];
    
    setTimeout(() => {
      const txn: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        amountUSD: planInfo.priceUSD,
        type: 'ACTIVATION',
        status: TransactionStatus.PROCESSING,
        timestamp: new Date().toISOString(),
        details: `Upgrade to ${planInfo.name} Plan`,
        planRequested: selectedPlan
      };
      
      onTransaction(txn);
      
      const updatedUser = { ...user, status: AccountStatus.PENDING_ACTIVATION };
      setState((prev: any) => ({
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map((u: User) => u.id === updatedUser.id ? updatedUser : u)
      }));
      
      setLoading(false);
      setIsPaying(false);
      alert('Activation request submitted! Admin will verify your payment shortly.');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">Boost Your Earnings</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
          Unlock higher daily limits and activate instant withdrawals. Choose a plan that fits your rhythm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Object.keys(PLAN_DETAILS) as PlanTier[]).map((tier) => {
          const plan = PLAN_DETAILS[tier];
          const isCurrent = user.plan === tier;
          const isFree = tier === PlanTier.FREE;
          const ngnPrice = plan.priceUSD * settings.usdToNgnRate;

          return (
            <div 
              key={tier}
              className={`glass-card p-8 rounded-[2.5rem] border-2 flex flex-col transition-all transform hover:scale-[1.02] ${
                isCurrent ? 'border-green-500 ring-4 ring-green-500/10' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">{plan.name}</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Plan Level</p>
                </div>
                {isCurrent && (
                  <span className="bg-green-500 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase">Current</span>
                )}
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">${plan.priceUSD}</span>
                  <span className="text-gray-500 text-xs font-bold uppercase">USD</span>
                </div>
                <p className="text-green-500 font-bold text-sm">₦{ngnPrice.toLocaleString()}</p>
              </div>

              <div className="space-y-4 flex-grow">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <i className="fas fa-music text-xs text-blue-500"></i>
                  </div>
                  <div>
                    <p className="text-white text-sm font-black">{plan.songLimit === Infinity ? 'Unlimited' : `${plan.songLimit} Songs`}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Daily Song Limit</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <i className={`fas ${plan.canWithdraw ? 'fa-unlock' : 'fa-lock'} text-xs ${plan.canWithdraw ? 'text-green-500' : 'text-red-500'}`}></i>
                  </div>
                  <div>
                    <p className="text-white text-sm font-black">{plan.canWithdraw ? 'Enabled' : 'Disabled'}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Withdrawals</p>
                  </div>
                </div>
              </div>

              <button
                disabled={isCurrent || isFree || user.status === AccountStatus.PENDING_ACTIVATION}
                onClick={() => handlePlanSelect(tier)}
                className={`w-full mt-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  isCurrent ? 'bg-green-500/20 text-green-500 cursor-default' :
                  isFree ? 'bg-white/5 text-gray-500 cursor-default' :
                  user.status === AccountStatus.PENDING_ACTIVATION ? 'bg-yellow-500/20 text-yellow-500 cursor-not-allowed' :
                  'bg-white text-black hover:bg-green-500 hover:text-black shadow-xl shadow-black/20'
                }`}
              >
                {isCurrent ? 'Active Plan' : isFree ? 'Default Free' : user.status === AccountStatus.PENDING_ACTIVATION ? 'Pending Review' : `Activate ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-10 rounded-[3rem] border border-white/5 text-center max-w-3xl mx-auto">
        <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">About Activation</h3>
        <p className="text-gray-400 font-medium leading-relaxed text-sm">
          Activation is a one-time process (or upgrade). Once activated, your withdrawal limit is set at <span className="text-green-500 font-bold">₦{settings.minWithdrawalNGN.toLocaleString()}</span>. 
          Limits reset automatically every 24 hours at 12:00 AM. 
          Upgrade at any time to unlock more songs and increase your earning potential.
        </p>
      </div>

      {isPaying && selectedPlan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-card max-w-md w-full p-10 rounded-[3rem] border border-green-500/30 relative">
            <button onClick={() => setIsPaying(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Confirm Upgrade</h3>
              <p className="text-gray-500 font-bold text-sm">Transfer exactly the amount shown below.</p>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Total Due</p>
                  <p className="text-3xl font-black text-white">₦{(PLAN_DETAILS[selectedPlan].priceUSD * settings.usdToNgnRate).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">USD Price</p>
                  <p className="text-xl font-black text-green-500">${PLAN_DETAILS[selectedPlan].priceUSD}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Bank Transfer (NGN)</p>
                  <p className="text-sm font-bold text-white">Bank: NeoBank Digital</p>
                  <p className="text-sm font-bold text-white">Account: 0123456789</p>
                  <p className="text-sm font-bold text-white">Name: BeatBucks Admin</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Crypto (USDT BEP20)</p>
                  <p className="text-[10px] font-mono text-white break-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</p>
                </div>
              </div>

              <p className="text-center text-[10px] text-gray-500 font-bold italic leading-relaxed">
                Send payment and click the button below. Our team will verify and upgrade your plan within 1-6 hours.
              </p>

              <button 
                onClick={confirmPayment}
                disabled={loading}
                className="w-full bg-green-500 text-black font-black py-5 rounded-2xl hover:bg-green-400 transition-all shadow-xl shadow-green-500/20 uppercase tracking-widest"
              >
                {loading ? 'Submitting...' : 'I HAVE SENT PAYMENT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activation;
