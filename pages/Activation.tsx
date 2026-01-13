
import React, { useState } from 'react';
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
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePayWithPaystack = (tier: PlanTier) => {
    if (tier === PlanTier.FREE) return;
    const planInfo = PLAN_DETAILS[tier];
    const ngnAmount = planInfo.priceUSD * settings.usdToNgnRate;

    const handler = PaystackPop.setup({
      key: settings.paystackPublicKey, // Use your configured public key
      email: user.email,
      amount: ngnAmount * 100, // Amount in kobo
      currency: "NGN",
      metadata: {
        custom_fields: [
          {
            display_name: "Plan Name",
            variable_name: "plan_name",
            value: planInfo.name
          }
        ]
      },
      callback: (response: any) => {
        // Response contains reference, status, message
        console.log("Payment Successful", response);
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
    alert('Payment Successful! Your account is now being reviewed. Check back in 5-15 mins for activation.');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Professional Activation</h1>
        <p className="text-gray-500 text-sm max-w-xl mx-auto font-bold uppercase tracking-widest">
          Boost daily limits and unlock payouts. Secure bank transfers powered by Paystack.
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
              className={`glass-card p-6 rounded-[2.5rem] border-2 flex flex-col transition-all ${
                isCurrent ? 'border-green-500 ring-4 ring-green-500/10' : 'border-white/5'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">{plan.name}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">Status: {isCurrent ? 'Current' : 'Tier'}</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">${plan.priceUSD}</span>
                </div>
                <p className="text-green-500 font-black text-xs uppercase tracking-tighter italic">≈ ₦{ngnPrice.toLocaleString()}</p>
              </div>

              <div className="space-y-4 flex-grow">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                    <i className="fas fa-headphones text-[10px]"></i>
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-black uppercase">{plan.songLimit === Infinity ? 'Unlimited' : `${plan.songLimit} Daily Songs`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <i className="fas fa-bolt text-[10px]"></i>
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-black uppercase">{plan.canWithdraw ? 'Full Withdrawals' : 'Earn Only'}</p>
                  </div>
                </div>
              </div>

              <button
                disabled={isCurrent || isFree || user.status === AccountStatus.PENDING_ACTIVATION || loading}
                onClick={() => handlePayWithPaystack(tier)}
                className={`w-full mt-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  isCurrent ? 'bg-green-500/20 text-green-500' :
                  isFree ? 'bg-white/5 text-gray-500' :
                  user.status === AccountStatus.PENDING_ACTIVATION ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-white text-black hover:bg-green-500 active:scale-95 shadow-xl'
                }`}
              >
                {loading ? 'Processing...' : isCurrent ? 'Active Plan' : isFree ? 'Default' : user.status === AccountStatus.PENDING_ACTIVATION ? 'Pending review' : `Boost Plan Now`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-10 rounded-[3rem] border border-white/5 text-center max-w-3xl mx-auto space-y-4">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-500 text-xl">
           <i className="fas fa-shield-alt"></i>
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter italic">Secure Online Checkout</h3>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
          Payments are handled via Paystack encrypted gateways. We never store your card details. Once payment is confirmed, your account status is automatically forwarded to our activation queue.
        </p>
      </div>
    </div>
  );
};

export default Activation;
