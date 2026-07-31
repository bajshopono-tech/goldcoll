import React, { useState } from 'react';
import { KaratRates, KaratType, PriceUnit, CategoryType } from '../types';
import { Sparkles, RefreshCw, Layers, Calculator, TrendingUp, DollarSign, ArrowUpRight, Scale } from 'lucide-react';

interface GoldRateBoardProps {
  ratesData: Record<KaratType, KaratRates> | null;
  lastUpdated: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export const GoldRateBoard: React.FC<GoldRateBoardProps> = ({
  ratesData,
  lastUpdated,
  onRefresh,
  isLoading,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<PriceUnit>('bhori');
  const [activeKarat, setActiveKarat] = useState<KaratType>('22k');
  
  // Quick Calculator State
  const [calcBhori, setCalcBhori] = useState<number>(1);
  const [calcAna, setCalcAna] = useState<number>(0);
  const [calcCategory, setCalcCategory] = useState<CategoryType>('newGold');
  const [showCalc, setShowCalc] = useState<boolean>(false);

  // BAJUS Tax & Making Charge States
  const [includeMakingCharge, setIncludeMakingCharge] = useState<boolean>(true);
  const [makingChargePerBhori, setMakingChargePerBhori] = useState<number>(6000); // Standard BAJUS minimum per bhori BDT
  const [includeVat, setIncludeVat] = useState<boolean>(true);
  const [vatPercent, setVatPercent] = useState<number>(5); // Standard BD Govt VAT 5%

  if (!ratesData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
        <p className="text-slate-300 font-medium">গোল্ড রেট আপডেট লোড হচ্ছে...</p>
      </div>
    );
  }

  const karatsList: { key: KaratType; label: string; bg: string }[] = [
    { key: '24k', label: '২৪ ক্যারেট (24K)', bg: 'from-amber-500/20 to-amber-600/10' },
    { key: '22k', label: '২২ ক্যারেট (22K)', bg: 'from-yellow-500/20 to-amber-500/10' },
    { key: '21k', label: '২১ ক্যারেট (21K)', bg: 'from-amber-600/20 to-orange-500/10' },
    { key: '18k', label: '১৮ ক্যারেট (18K)', bg: 'from-orange-500/20 to-amber-700/10' },
    { key: 'sanatan', label: 'সনাতন পদ্ধতি (Traditional)', bg: 'from-slate-700/30 to-amber-900/20' },
  ];

  const currentKaratData = ratesData[activeKarat];

  // Helper formatting BDT currency
  const formatBDT = (num: number) => {
    return '৳ ' + Math.round(num).toLocaleString('bn-BD');
  };

  // Helper unit label
  const unitLabel = selectedUnit === 'bhori' ? 'প্রতি ভরি' : selectedUnit === 'gram' ? 'প্রতি গ্রাম' : 'প্রতি আনা';

  // Calculator price calculation
  const getSelectedPriceUnit = (kType: KaratType, cat: CategoryType, unit: PriceUnit) => {
    return ratesData[kType][unit][cat];
  };

  const unitRateCalc = getSelectedPriceUnit(activeKarat, calcCategory, 'bhori');
  // 1 Bhori = 16 Ana
  const totalBhoriEquivalent = calcBhori + calcAna / 16;
  
  // Tax & Making Charge Itemized Calculations
  const baseGoldCost = Math.round(unitRateCalc * totalBhoriEquivalent);
  const totalMakingCharge = (includeMakingCharge && calcCategory !== 'oldGold') 
    ? Math.round(makingChargePerBhori * totalBhoriEquivalent) 
    : 0;
  const subTotalBeforeVat = baseGoldCost + totalMakingCharge;
  const totalVat = (includeVat && calcCategory !== 'oldGold') 
    ? Math.round(subTotalBeforeVat * (vatPercent / 100)) 
    : 0;
  const grandTotalCost = subTotalBeforeVat + totalVat;

  return (
    <div className="space-y-5">
      {/* Rate Board Top Header Controls */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-[#E4E4E7] tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#EAB308]" />
                লাইভ গোল্ড প্রাইস (Live Rate Board)
              </h2>
            </div>
            <p className="text-xs text-[#71717A] mt-1">
              ব্যবসায়ীদের জন্য নতুন, পুরাতন, পাইকারি ও খুচরা বাজারের তাৎক্ষণিক লাইভ দাম
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-2 bg-[#121214] hover:bg-[#212124] text-[#E4E4E7] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#27272A]"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#EAB308] ${isLoading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>

            {/* Quick Calculator Toggle */}
            <button
              onClick={() => setShowCalc(!showCalc)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                showCalc
                  ? 'bg-[#EAB308] text-black border-[#EAB308] font-bold'
                  : 'bg-[#121214] text-[#EAB308] border-[#27272A] hover:bg-[#212124]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>হিসাব ক্যালকুলেটর</span>
            </button>
          </div>
        </div>

        {/* Unit Selector Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#27272A]">
          <span className="text-xs font-semibold text-[#A1A1AA]">পরিমাপের একক:</span>
          <div className="flex items-center gap-1 bg-[#0A0A0B] p-1 rounded-xl border border-[#27272A]">
            <button
              onClick={() => setSelectedUnit('bhori')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedUnit === 'bhori'
                  ? 'bg-[#EAB308] text-black shadow-md'
                  : 'text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              ভরি (১১.৬৬৪ গ্রাম)
            </button>
            <button
              onClick={() => setSelectedUnit('gram')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedUnit === 'gram'
                  ? 'bg-[#EAB308] text-black shadow-md'
                  : 'text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              গ্রাম (১.০০ গ্রাম)
            </button>
            <button
              onClick={() => setSelectedUnit('ana')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedUnit === 'ana'
                  ? 'bg-[#EAB308] text-black shadow-md'
                  : 'text-[#71717A] hover:text-[#E4E4E7]'
              }`}
            >
              আনা (১/১৬ ভরি)
            </button>
          </div>
        </div>
      </div>

      {/* Quick Trade Calculator Panel */}
      {showCalc && (
        <div className="bg-[#18181B] border border-[#EAB308]/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <h3 className="text-sm font-bold text-[#EAB308] flex items-center gap-2">
              <Scale className="w-4 h-4" />
              স্বর্ণ ক্রয়/বিক্রয় হিসাব ক্যালকুলেটর
            </h3>
            <span className="text-xs font-mono text-[#71717A]">
              ক্যারেট: {activeKarat.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">ভরি (Bhori):</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={calcBhori}
                onChange={(e) => setCalcBhori(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#EAB308]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">আনা (Ana):</label>
              <input
                type="number"
                min="0"
                max="15"
                value={calcAna}
                onChange={(e) => setCalcAna(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#EAB308]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">ক্যাটাগরি:</label>
              <select
                value={calcCategory}
                onChange={(e) => setCalcCategory(e.target.value as CategoryType)}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#EAB308]"
              >
                <option value="newGold">নতুন স্বর্ণ (New Gold)</option>
                <option value="oldGold">পুরাতন স্বর্ণ (Scrap Buyback)</option>
                <option value="wholesale">পাইকারি দাম (Wholesale)</option>
                <option value="retail">খুচরা বাজার (Retail)</option>
              </select>
            </div>
          </div>

          {/* Tax & Making Charge Custom Controls */}
          {calcCategory !== 'oldGold' && (
            <div className="p-3 bg-[#0A0A0B] border border-[#27272A] rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chkMaking"
                    checked={includeMakingCharge}
                    onChange={(e) => setIncludeMakingCharge(e.target.checked)}
                    className="accent-[#EAB308] w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor="chkMaking" className="font-semibold text-white cursor-pointer">
                    মজুরি যুক্ত করুন (Making Charge)
                  </label>
                </div>
                {includeMakingCharge && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#A1A1AA]">মজুরি/ভরি:</span>
                    <input
                      type="number"
                      step="500"
                      value={makingChargePerBhori}
                      onChange={(e) => setMakingChargePerBhori(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-24 bg-[#121214] border border-[#27272A] rounded-lg px-2 py-1 text-xs font-mono text-[#EAB308] text-right focus:outline-none focus:border-[#EAB308]"
                    />
                    <span className="text-[#71717A]">টাকা</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-[#1F1F22]">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chkVat"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                    className="accent-[#EAB308] w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor="chkVat" className="font-semibold text-white cursor-pointer">
                    সরকারি ভ্যাট/ট্যাক্স (Govt VAT 5%)
                  </label>
                </div>
                {includeVat && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#A1A1AA]">ভ্যাট হার:</span>
                    <input
                      type="number"
                      step="0.5"
                      value={vatPercent}
                      onChange={(e) => setVatPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-16 bg-[#121214] border border-[#27272A] rounded-lg px-2 py-1 text-xs font-mono text-[#22C55E] text-right focus:outline-none focus:border-[#22C55E]"
                    />
                    <span className="text-[#71717A]">%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Itemized Cash Memo Receipt */}
          <div className="bg-[#121214] border border-[#EAB308]/40 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs border-b border-[#27272A] pb-2 text-[#A1A1AA]">
              <span>ক্যাশমেমো মেমো উপাদান</span>
              <span>পরিমাণ ({calcBhori} ভরি {calcAna} আনা)</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#E4E4E7]">
                <span>১. বিশুদ্ধ স্বর্ণের মুল দাম ({activeKarat.toUpperCase()}):</span>
                <span className="font-mono">{formatBDT(baseGoldCost)}</span>
              </div>

              {includeMakingCharge && calcCategory !== 'oldGold' && (
                <div className="flex justify-between text-[#EAB308]">
                  <span>২. বাজুস সর্বনিম্ন মজুরি (@ ৳{makingChargePerBhori.toLocaleString()}/ভরি):</span>
                  <span className="font-mono">+ {formatBDT(totalMakingCharge)}</span>
                </div>
              )}

              {includeVat && calcCategory !== 'oldGold' && (
                <div className="flex justify-between text-[#22C55E]">
                  <span>৩. সরকারি ভ্যাট/ট্যাক্স ({vatPercent}% VAT):</span>
                  <span className="font-mono">+ {formatBDT(totalVat)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#71717A] block font-medium">
                  সর্বমোট পরিশোধযোগ্য গ্রাহক ক্যাশমেমো মূল্য
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-[#EAB308]">
                  {formatBDT(grandTotalCost)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#71717A] block">একক ভিত্তিমূল্য</span>
                <span className="text-xs font-mono font-bold text-[#A1A1AA]">
                  {formatBDT(unitRateCalc)} /ভরি
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Karat Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {karatsList.map((k) => {
          const isActive = activeKarat === k.key;
          const kPrice = ratesData[k.key][selectedUnit].newGold;
          return (
            <button
              key={k.key}
              onClick={() => setActiveKarat(k.key)}
              className={`p-3 rounded-2xl border transition-all text-left relative overflow-hidden ${
                isActive
                  ? 'bg-[#18181B] border-[#EAB308] shadow-lg shadow-[#EAB308]/10'
                  : 'bg-[#121214] border-[#27272A] hover:border-[#3F3F46]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-black uppercase ${isActive ? 'text-[#EAB308]' : 'text-[#A1A1AA]'}`}>
                  {k.key}
                </span>
                {isActive && <span className="w-2 h-2 rounded-full bg-[#EAB308]" />}
              </div>
              <p className="text-[11px] text-[#71717A] line-clamp-1">{k.label.split('(')[0]}</p>
              <p className="text-sm font-mono font-bold text-[#EAB308] mt-1">
                {formatBDT(kPrice)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Karat Detailed Price Breakdown Cards */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#EAB308]" />
              {activeKarat.toUpperCase()} স্বর্ণের ৪টি মূল দামের বিস্তারিত
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              ঐক্যবদ্ধ পরিমাপ: <span className="text-[#EAB308] font-semibold">{unitLabel}</span>
            </p>
          </div>
          <span className="px-3 py-1 bg-[#EAB308]/10 border border-[#EAB308]/30 text-[#EAB308] text-xs font-mono font-bold rounded-full">
            {activeKarat === '24k' ? '100% বিশুদ্ধ' : activeKarat === '22k' ? '91.7% বিশুদ্ধ' : activeKarat === '21k' ? '87.5% বিশুদ্ধ' : activeKarat === '18k' ? '75.0% বিশুদ্ধ' : 'সনাতন (৬২.৫% বিশুদ্ধ)'}
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: New Gold */}
          <div className="bg-[#121214] border border-[#EAB308]/30 rounded-xl p-4 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#EAB308] uppercase tracking-wide">
                নতুন স্বর্ণের দাম
              </span>
              <span className="px-2 py-0.5 bg-[#EAB308]/20 text-[#EAB308] text-[10px] font-bold rounded">
                নিউ গহনা
              </span>
            </div>
            <div className="py-1">
              <span className="text-2xl font-mono font-black text-[#EAB308] tracking-tight">
                {formatBDT(currentKaratData[selectedUnit].newGold)}
              </span>
              <span className="text-[11px] text-[#71717A] block mt-0.5">{unitLabel}</span>
            </div>
            <p className="text-[11px] text-[#71717A] border-t border-[#27272A] pt-2">
              পাকা স্বর্ণ / নতুন অলঙ্কার তৈরির প্রমিত ভিত্তিমূল্য।
            </p>
          </div>

          {/* Card 2: Old Gold */}
          <div className="bg-[#121214] border border-[#27272A] rounded-xl p-4 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wide">
                পুরাতন স্বর্ণের দাম
              </span>
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded">
                বাইব্যাক / পুরাতন
              </span>
            </div>
            <div className="py-1">
              <span className="text-2xl font-mono font-black text-[#E4E4E7] tracking-tight">
                {formatBDT(currentKaratData[selectedUnit].oldGold)}
              </span>
              <span className="text-[11px] text-[#71717A] block mt-0.5">{unitLabel}</span>
            </div>
            <p className="text-[11px] text-[#71717A] border-t border-[#27272A] pt-2">
              গ্রাহকের থেকে ব্যবহৃত/পুরাতন স্বর্ণ ক্রয়ের নির্ধারিত বাইব্যাক দর।
            </p>
          </div>

          {/* Card 3: Wholesale */}
          <div className="bg-[#121214] border border-[#27272A] rounded-xl p-4 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
                পাইকারি দাম
              </span>
              <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-bold rounded">
                হোলসেল
              </span>
            </div>
            <div className="py-1">
              <span className="text-2xl font-mono font-black text-sky-200 tracking-tight">
                {formatBDT(currentKaratData[selectedUnit].wholesale)}
              </span>
              <span className="text-[11px] text-[#71717A] block mt-0.5">{unitLabel}</span>
            </div>
            <p className="text-[11px] text-[#71717A] border-t border-[#27272A] pt-2">
              জুয়েলার্স ব্যবসায়ী ও বুলিয়ন মার্কেট ট্রেডারদের পাইকারি দর।
            </p>
          </div>

          {/* Card 4: Retail Market (with BAJUS Making Charge & VAT) */}
          <div className="bg-[#121214] border border-[#22C55E]/40 rounded-xl p-4 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wide">
                খুচরা বিক্রয় মূল্য (ভ্যাট+মজুরিসহ)
              </span>
              <span className="px-2 py-0.5 bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold rounded">
                বাজুস ক্যাশমেমো
              </span>
            </div>
            <div className="py-1">
              {(() => {
                const basePrice = ratesData[activeKarat]?.bhori?.newGold || 0;
                const minMaking = 6000; // BAJUS standard min making charge per bhori
                const vatAmt = Math.round((basePrice + minMaking) * 0.05);
                const fullBhoriRetail = basePrice + minMaking + vatAmt;
                
                // Scale according to selected unit
                const unitScale = selectedUnit === 'bhori' ? 1 : selectedUnit === 'gram' ? (1 / 11.664) : (1 / 16);
                const displayTotal = Math.round(fullBhoriRetail * unitScale);

                return (
                  <>
                    <span className="text-2xl font-mono font-black text-[#22C55E] tracking-tight">
                      {formatBDT(displayTotal)}
                    </span>
                    <span className="text-[11px] text-[#71717A] block mt-0.5">{unitLabel} (সর্বমোট)</span>
                    
                    <div className="mt-2 pt-2 border-t border-[#27272A] text-[11px] space-y-1 text-[#A1A1AA]">
                      <div className="flex justify-between">
                        <span>স্বর্ণের মূল দর:</span>
                        <span className="font-mono text-white">{formatBDT(Math.round(basePrice * unitScale))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>বাজুস মজুরি:</span>
                        <span className="font-mono text-[#EAB308]">+ {formatBDT(Math.round(minMaking * unitScale))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>সরকারি ভ্যাট (৫%):</span>
                        <span className="font-mono text-[#22C55E]">+ {formatBDT(Math.round(vatAmt * unitScale))}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <p className="text-[11px] text-[#71717A] border-t border-[#27272A] pt-2">
              বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন (BAJUS) নিয়মানুসারে ক্যাশমেমোর চূড়ান্ত খুচরা দর।
            </p>
          </div>
        </div>

        {/* Master Comparison Table for All Karats */}
        <div className="pt-4 border-t border-[#27272A] space-y-3">
          <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
            সকল ক্যারেটের একনজরে তুলনা সারণী ({unitLabel})
          </h4>

          <div className="overflow-x-auto rounded-xl border border-[#27272A] bg-[#121214]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#27272A] bg-[#18181B] text-[#71717A] font-semibold text-[10px] uppercase">
                  <th className="p-3">টাইপ / ক্যারেট</th>
                  <th className="p-3 text-[#EAB308]">নতুন স্বর্ণ (ভিত্তিমূল্য)</th>
                  <th className="p-3 text-[#A1A1AA]">পুরাতন (বাইব্যাক)</th>
                  <th className="p-3 text-sky-300">পাইকারি</th>
                  <th className="p-3 text-[#22C55E]">খুচরা (ভ্যাট+মজুরিসহ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F22] font-mono text-[#E4E4E7]">
                {karatsList.map((k) => {
                  const data = ratesData[k.key]?.[selectedUnit] || { newGold: 0, oldGold: 0, wholesale: 0, retail: 0 };
                  const isCur = k.key === activeKarat;

                  // BAJUS full retail calculation
                  const bhoriBase = ratesData[k.key]?.bhori?.newGold || 0;
                  const minMaking = 6000;
                  const vatAmt = Math.round((bhoriBase + minMaking) * 0.05);
                  const fullBhoriRetail = bhoriBase + minMaking + vatAmt;
                  const unitScale = selectedUnit === 'bhori' ? 1 : selectedUnit === 'gram' ? (1 / 11.664) : (1 / 16);
                  const fullRetailVal = Math.round(fullBhoriRetail * unitScale);

                  return (
                    <tr
                      key={k.key}
                      onClick={() => setActiveKarat(k.key)}
                      className={`cursor-pointer transition-colors ${
                        isCur ? 'bg-[#EAB308]/10 font-bold' : 'hover:bg-[#18181B]'
                      }`}
                    >
                      <td className="p-3 font-sans font-bold text-white flex items-center gap-1.5">
                        <span className="uppercase text-[#EAB308]">{k.key}</span>
                        {isCur && <span className="text-[10px] text-[#EAB308]">(সক্রিয়)</span>}
                      </td>
                      <td className="p-3 text-[#EAB308] font-bold">{formatBDT(data.newGold)}</td>
                      <td className="p-3 text-[#A1A1AA]">{formatBDT(data.oldGold)}</td>
                      <td className="p-3 text-sky-300">{formatBDT(data.wholesale)}</td>
                      <td className="p-3 text-[#22C55E] font-bold">{formatBDT(fullRetailVal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
