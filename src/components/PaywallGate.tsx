import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Lock, Smartphone, RefreshCw, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { UserPayment } from '../types';

interface PaywallGateProps {
  onUnlockSuccess: (user: UserPayment) => void;
}

export const PaywallGate: React.FC<PaywallGateProps> = ({ onUnlockSuccess }) => {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [method, setMethod] = useState<'bkash_personal' | 'nagad_personal' | 'nagad_agent'>('bkash_personal');
  const [trxId, setTrxId] = useState('');
  const [demoCode, setDemoCode] = useState('');
  
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [checkPhone, setCheckPhone] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const bkashNagadPersonal = '01316567821';
  const nagadAgent = '01617247421';

  const copyToClipboard = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!userPhone || userPhone.length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।');
      return;
    }
    if (!trxId) {
      setErrorMsg('ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName || 'গোল্ড ট্রেডার',
          userPhone,
          method,
          targetNumber: method === 'nagad_agent' ? nagadAgent : bkashNagadPersonal,
          trxId,
          demoCode
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.user) {
        if (data.user.status === 'approved') {
          setSuccessMsg(data.message);
          setTimeout(() => {
            onUnlockSuccess(data.user);
          }, 1200);
        } else {
          setSuccessMsg('আপনার পেমেন্ট রিকোয়েস্ট জমা হয়েছে! এডমিন ভেরিফাই করলে স্বয়ংক্রিয়ভাবে অ্যাপসটি আনলক হবে।');
        }
      } else {
        setErrorMsg(data.message || 'পেমেন্ট সাবমিট করা যায়নি। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('সার্ভারে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।');
    }
  };

  const handleCheckExistingStatus = async () => {
    if (!checkPhone) {
      setErrorMsg('স্ট্যাটাস চেক করতে আপনার মোবাইল নম্বর দিন।');
      return;
    }
    setIsCheckingStatus(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/payments/status?phone=${encodeURIComponent(checkPhone.trim())}`);
      const data = await res.json();
      setIsCheckingStatus(false);

      if (data.success && data.user) {
        if (data.user.status === 'approved') {
          setSuccessMsg('অভিনন্দন! আপনার সাবস্ক্রিপশন সচল রয়েছে।');
          setTimeout(() => {
            onUnlockSuccess(data.user);
          }, 1000);
        } else if (data.user.status === 'pending') {
          setSuccessMsg('আপনার পেমেন্ট ভেরিফিকেশন পেন্ডিং রয়েছে। এডমিন শীঘ্রই অনুমোদন করবেন।');
        } else {
          setErrorMsg('আপনার পেমেন্ট বাতিল করা হয়েছে। আবার পেমেন্ট করুন।');
        }
      } else {
        setErrorMsg('এই নম্বরে কোন অনুমোদিত পেমেন্ট পাওয়া যায়নি।');
      }
    } catch (err) {
      setIsCheckingStatus(false);
      setErrorMsg('ভেরিফিকেশনে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden">
      {/* Top Gold Badge Header */}
      <div className="w-full max-w-md mx-auto text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAB308]/10 border border-[#EAB308]/30 text-[#EAB308] text-xs font-semibold uppercase tracking-wider mb-3">
          <Lock className="w-3.5 h-3.5" />
          সুরক্ষিত সদস্যপদ পোর্টাল
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
          স্বর্ণের বাজার বিশ্লেষণ অ্যাপ
        </h1>
        <p className="text-[#71717A] text-sm mt-1.5 px-2">
          লাইভ ২৪K, ২২K, ২১K, ১৮K রেট ও পূর্বাভাস দেখতে মাসিক সাবস্ক্রিপশন সম্পন্ন করুন।
        </p>
      </div>

      {/* Main Pricing Box */}
      <div className="w-full max-w-md bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-5 sm:p-6 space-y-6 relative overflow-hidden">
        {/* Golden glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#EAB308]/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Fee Tag */}
        <div className="bg-[#121214] border border-[#EAB308]/40 rounded-xl p-4 text-center">
          <span className="text-xs font-medium text-[#EAB308] uppercase tracking-wider block mb-1">
            মাসিক চার্জ
          </span>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-[#EAB308]">৳ ২০০</span>
            <span className="text-[#71717A] text-sm font-semibold">/ মাস</span>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            পেমেন্ট করার পরই লাইভ রেট বোর্ড ও সকল ফিচার আনলক হবে।
          </p>
        </div>

        {/* Payment Numbers Instructions */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-[#EAB308]" />
            পেমেন্ট সার্ভিস নম্বরসমূহ
          </h2>

          {/* Number Box 1: Personal */}
          <div className="bg-[#121214] border border-[#27272A] rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-bold rounded">bKash</span>
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded">Nagad</span>
                <span className="text-xs text-[#71717A] font-medium">(পার্সোনাল)</span>
              </div>
              <p className="text-sm sm:text-base font-mono font-bold text-[#E4E4E7] tracking-wide">
                {bkashNagadPersonal}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(bkashNagadPersonal)}
              className="p-2 bg-[#212124] hover:bg-[#2D2D31] text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border border-[#27272A]"
            >
              {copiedNumber === bkashNagadPersonal ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span className="text-[#22C55E] text-[11px]">কপিড</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span className="text-[11px] text-[#A1A1AA]">কপি</span>
                </>
              )}
            </button>
          </div>

          {/* Number Box 2: Nagad Agent */}
          <div className="bg-[#121214] border border-[#27272A] rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded">Nagad Agent</span>
                <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-[10px] font-bold rounded">bKash Agent</span>
              </div>
              <p className="text-sm sm:text-base font-mono font-bold text-[#E4E4E7] tracking-wide">
                {nagadAgent}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(nagadAgent)}
              className="p-2 bg-[#212124] hover:bg-[#2D2D31] text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border border-[#27272A]"
            >
              {copiedNumber === nagadAgent ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span className="text-[#22C55E] text-[11px]">কপিড</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span className="text-[11px] text-[#A1A1AA]">কপি</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl text-[#22C55E] text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Payment Submission Form */}
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#A1A1AA]">
              আপনার নাম (ঐচ্ছিক):
            </label>
            <input
              type="text"
              placeholder="যেমন: মোঃ কামরুল ইসলাম"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#EAB308]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#A1A1AA]">
              আপনার মোবাইল নম্বর (যেখান থেকে সেন্ড মানি/ক্যাশআউট করেছেন)*:
            </label>
            <input
              type="tel"
              required
              placeholder="01XXXXXXXXX"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#EAB308]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">পেমেন্ট মেথড*:</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#EAB308]"
              >
                <option value="bkash_personal">bKash (01316567821)</option>
                <option value="nagad_personal">Nagad (01316567821)</option>
                <option value="nagad_agent">Nagad Agent (01617247421)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">TrxID (ট্রানজেকশন আইডি)*:</label>
              <input
                type="text"
                required
                placeholder="যেমন: B8X9K221"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2.5 text-xs font-mono uppercase text-white focus:outline-none focus:border-[#EAB308]"
              />
            </div>
          </div>



          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#EAB308] hover:bg-[#B45309] text-black font-extrabold text-sm rounded-xl shadow-lg shadow-[#EAB308]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <span>পেমেন্ট সাবমিট করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing User Login & Quick Status Check */}
        <div className="pt-5 border-t border-[#27272A] space-y-3">
          <div className="bg-[#121214] border border-[#EAB308]/30 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#EAB308]" />
              <h3 className="text-xs font-bold text-white">
                ইতিমধ্যে পেমেন্ট করেছেন? মোবাইল নম্বর দিয়ে লগইন করুন
              </h3>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">
              আপনার নিবন্ধিত মোবাইল নম্বরটি লিখুন এবং সরাসরি অ্যাপসে লগইন করুন।
            </p>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="০১৮XXXXXXXX"
                value={checkPhone}
                onChange={(e) => setCheckPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckExistingStatus()}
                className="flex-1 bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#EAB308]"
              />
              <button
                type="button"
                onClick={handleCheckExistingStatus}
                disabled={isCheckingStatus}
                className="px-4 py-2 bg-[#EAB308]/15 hover:bg-[#EAB308]/25 text-[#EAB308] border border-[#EAB308]/40 font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {isCheckingStatus ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>যাচাই হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>লগইন করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
