
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AppSettings, Transaction, AccountStatus, PlanTier, TransactionStatus } from '../types';
import { PLAN_DETAILS } from '../constants';

interface ActivationProps {
  user: User;
  settings: AppSettings;
  onTransaction: (txn: Transaction) => void;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

declare const PaystackPop: any;

const Activation: React.FC<ActivationProps> = ({ user, settings, onTransaction, setState }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayWithPaystack = (tier: PlanTier) => {
    if (tier === PlanTier.FREE) return;
    const planInfo = PLAN_DETAILS[tier];
    const ngnAmount = planInfo.priceUSD * settings.usdToNgnRate;

    const handler = PaystackPop.setup({
      key: settings.paystackPublicKey, 
      email: user.email,
      amount: ngnAmount * 100, 
      currency: "NGN",
      callback: (response: any) => {
        confirmPayment(tier);
      },
      onClose: () => {
        setLoading(false);
      }
    });

    setLoading(true);
    handler.openIframe();
  };

  const confirmPayment = (tier: PlanTier) => {
    const planInfo = PLAN_DETAILS[tier];
    const txn: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      amountUSD: planInfo.priceUSD,
      type: 'ACTIVATION',
      status: TransactionStatus.PROCESSING,
      timestamp: new Date().toISOString(),
      details: `Online activation for ${planInfo.name} Plan`,
      planRequested: tier
    };
    
    onTransaction(txn);
    
    const updatedUser = { ...user, status: AccountStatus.PENDING_ACTIVATION };
    setState((prev: any) => ({
      ...prev,
      currentUser: updatedUser,
      users: prev.users.map((u: User) => u.id === updatedUser.id ? updatedUser : u)
    }));
    
    setLoading(false);
    alert('Activation Request Sent! Your account will be upgraded shortly.');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 pb-32">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/10 active:scale-90 transition-all"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <div className="text-right">
           <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Boost Rank</h1>
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Institutional Tiers</h2>
        <p className="text-gray-500 text-xs max-w-sm mx-auto font-black uppercase tracking-[0.3em] leading-relaxed">
          Upgrade your node status to unlock high-yield audio assets and local settlements.
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
              className={`glass-card p-8 rounded-[3rem] border-2 flex flex-col transition-all ${
                isCurrent ? 'border-green-500 ring-4 ring-green-500/10' : 'border-white/5 shadow-2xl'
              }`}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">{plan.name}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{isCurrent ? 'Current' : 'Status'}</p>
                </div>
                {isCurrent && <i className="fas fa-check-circle text-green-500 text-xl"></i>}
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">${plan.priceUSD}</span>
                </div>
                <p className="text-green-500 font-black text-[10px] uppercase tracking-tighter italic">≈ ₦{ngnPrice.toLocaleString()}</p>
              </div>

              <div className="space-y-6 flex-grow">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <i className="fas fa-music text-[10px]"></i>
                  </div>
                  <p className="text-white text-[11px] font-black uppercase tracking-tighter">{plan.songLimit === Infinity ? 'Infinite Songs' : `${plan.songLimit} Assets Daily`}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <i className="fas fa-wallet text-[10px]"></i>
                  </div>
                  <p className="text-white text-[11px] font-black uppercase tracking-tighter">{plan.canWithdraw ? 'Full Settlements' : 'Accumulation Only'}</p>
                </div>
              </div>

              <button
                disabled={isCurrent || isFree || user.status === AccountStatus.PENDING_ACTIVATION || loading}
                onClick={() => handlePayWithPaystack(tier)}
                className={`w-full mt-12 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl ${
                  isCurrent ? 'bg-green-500/20 text-green-500 cursor-default' :
                  isFree ? 'bg-white/5 text-gray-500 cursor-default' :
                  user.status === AccountStatus.PENDING_ACTIVATION ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-white text-black hover:bg-green-500 active:scale-95'
                }`}
              >
                {loading ? 'Initializing...' : isCurrent ? 'Active Node' : isFree ? 'Default' : user.status === AccountStatus.PENDING_ACTIVATION ? 'Reviewing' : `Initialize Boost`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Activation;
