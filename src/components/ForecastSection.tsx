import React, { useState } from 'react';
import { ForecastItem } from '../types';
import { TrendingUp, TrendingDown, Minus, Calendar, AlertTriangle, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

interface ForecastSectionProps {
  forecasts: Record<string, ForecastItem> | null;
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({ forecasts }) => {
  const [activePeriod, setActivePeriod] = useState<'1_week' | '1_month'>('1_week');

  if (!forecasts) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        পূর্বাভাস আপডেট তথ্য লোড হচ্ছে...
      </div>
    );
  }

  const currentForecast = forecasts[activePeriod] || forecasts['1_week'];

  const getTrendBadge = (trend: 'bullish' | 'bearish' | 'stable') => {
    if (trend === 'bullish') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-full">
          <TrendingUp className="w-3.5 h-3.5" />
          দাম বৃদ্ধির সম্ভাবনা (Bullish 📈)
        </span>
      );
    }
    if (trend === 'bearish') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-xs rounded-full">
          <TrendingDown className="w-3.5 h-3.5" />
          দাম কমার সম্ভাবনা (Bearish 📉)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-500/20 border border-sky-500/40 text-sky-400 font-bold text-xs rounded-full">
        <Minus className="w-3.5 h-3.5" />
        বাজার স্থিতিশীল (Stable ⚖️)
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Forecast Header */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#E4E4E7] tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#EAB308]" />
              মার্কেট পূর্বাভাস (Market Forecast)
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              আন্তর্জাতিক বাজার বিশ্লেষণ ও এডমিন প্যানেল থেকে হালনাগাদকৃত ১ সপ্তাহ ও ১ মাসের পূর্বাভাস
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 bg-[#0A0A0B] p-1 rounded-xl border border-[#27272A] shrink-0">
            <button
              onClick={() => setActivePeriod('1_week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activePeriod === '1_week'
                  ? 'bg-[#EAB308] text-black shadow-md'
                  : 'text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>১ সপ্তাহের পূর্বাভাস</span>
            </button>
            <button
              onClick={() => setActivePeriod('1_month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activePeriod === '1_month'
                  ? 'bg-[#EAB308] text-black shadow-md'
                  : 'text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>১ মাসের পূর্বাভাস</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Forecast Content Card */}
      {currentForecast && (
        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
          {/* Top Status Line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
            <div>
              <span className="text-xs font-bold text-[#EAB308] uppercase tracking-wider block mb-1">
                {currentForecast.title}
              </span>
              <div className="flex items-center gap-2">
                {getTrendBadge(currentForecast.trend)}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-[#71717A] block font-medium">সর্বশেষ আপডেট</span>
              <span className="text-xs font-mono text-[#A1A1AA] font-bold">
                {new Date(currentForecast.updatedAt).toLocaleDateString('bn-BD', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Forecast Expected Range Box */}
          <div className="bg-[#121214] border border-[#27272A] rounded-xl p-4 sm:p-5 space-y-3">
            <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider block">
              ২২ ক্যারেট সম্ভাব্য আনুমানিক দর সীমা (প্রতি ভরি)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#212124] p-3.5 rounded-lg border border-[#2D2D31]">
                <span className="text-[11px] text-[#EF4444] block font-semibold mb-0.5">
                  নূন্যতম সম্ভাব্য দর (Minimum Expected)
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-rose-300">
                  ৳ {currentForecast.expectedMin22kBhori.toLocaleString('bn-BD')} /ভরি
                </span>
              </div>

              <div className="bg-[#212124] p-3.5 rounded-lg border border-[#2D2D31]">
                <span className="text-[11px] text-[#22C55E] block font-semibold mb-0.5">
                  সর্বোচ্চ সম্ভাব্য দর (Maximum Expected)
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-[#22C55E]">
                  ৳ {currentForecast.expectedMax22kBhori.toLocaleString('bn-BD')} /ভরি
                </span>
              </div>
            </div>
          </div>

          {/* Expert Advice Box */}
          <div className="bg-[#212124] border border-[#2D2D31] rounded-xl p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-[#EAB308] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              ব্যবসায়ীদের জন্য পরামর্শ (Trading Strategy):
            </h4>
            <p className="text-sm text-[#E4E4E7] leading-relaxed font-medium">
              {currentForecast.advice}
            </p>
          </div>

          {/* Admin Note Box */}
          <div className="bg-[#121214] border border-[#27272A] rounded-xl p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-[#EAB308] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#EAB308]" />
              এডমিন এনালাইসিস নোট (Market Analysis Rationale):
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed font-mono">
              {currentForecast.adminNote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
