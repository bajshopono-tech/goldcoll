import React, { useState, useEffect, useRef } from 'react';
import { UserPayment, ForecastItem, GoldRatesResponse } from '../types';
import { Shield, KeyRound, CheckCircle, XCircle, Trash2, Search, RefreshCw, DollarSign, Edit3, Plus, Lock, Unlock, Users, TrendingUp, AlertCircle, Save, Sparkles } from 'lucide-react';

interface AdminPanelProps {
  ratesData: GoldRatesResponse | null;
  forecasts: Record<string, ForecastItem> | null;
  onRefreshAll: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ ratesData, forecasts, onRefreshAll }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bd_gold_admin_token') === 'admin-authenticated-token';
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Admin Sub-tabs
  const [adminTab, setAdminTab] = useState<'users' | 'rates' | 'forecasts' | 'freefire'>('users');

  // Users Management State
  const [users, setUsers] = useState<UserPayment[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Rate Editing State
  const [override24k, setOverride24k] = useState<string>('');
  const [usdRate, setUsdRate] = useState<string>('');
  const [goldUsdOz, setGoldUsdOz] = useState<string>('');
  const [isSavingRates, setIsSavingRates] = useState<boolean>(false);
  const [rateSuccessMsg, setRateSuccessMsg] = useState<string>('');

  // Forecast Editing State
  const [forecastPeriod, setForecastPeriod] = useState<'1_week' | '1_month'>('1_week');
  const [forecastTitle, setForecastTitle] = useState<string>('');
  const [forecastMin, setForecastMin] = useState<string>('');
  const [forecastMax, setForecastMax] = useState<string>('');
  const [forecastTrend, setForecastTrend] = useState<'bullish' | 'bearish' | 'stable'>('bullish');
  const [forecastAdvice, setForecastAdvice] = useState<string>('');
  const [forecastNote, setForecastNote] = useState<string>('');
  const [isSavingForecast, setIsSavingForecast] = useState<boolean>(false);
  const [forecastSuccessMsg, setForecastSuccessMsg] = useState<string>('');

  // Free Fire Signal State
  const [ffTitle, setFfTitle] = useState<string>('');
  const [ffCategory, setFfCategory] = useState<string>('');
  const [ffTarget, setFfTarget] = useState<string>('');
  const [ffType, setFfType] = useState<'BUY' | 'SELL' | 'HOLD'>('BUY');
  const [ffOdds, setFfOdds] = useState<string>('90%');
  const [ffDesc, setFfDesc] = useState<string>('');
  const [isSavingFf, setIsSavingFf] = useState<boolean>(false);
  const [ffSuccessMsg, setFfSuccessMsg] = useState<string>('');

  // Fetch Users when authenticated
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const [useAutoUsdCalc, setUseAutoUsdCalc] = useState<boolean>(true);
  const ratesInitializedRef = useRef<boolean>(false);
  const lastLoadedForecastPeriodRef = useRef<string | null>(null);

  // Load existing rates into edit fields ONCE when ratesData first loads
  useEffect(() => {
    if (ratesData && !ratesInitializedRef.current) {
      setUsdRate(ratesData.usdToBdt ? ratesData.usdToBdt.toString() : '122.5');
      setGoldUsdOz(ratesData.rawUsdOz ? ratesData.rawUsdOz.toString() : '2750');
      if (ratesData.base24kBhoriBDT) {
        setOverride24k(ratesData.base24kBhoriBDT.toString());
        setUseAutoUsdCalc(false);
      }
      ratesInitializedRef.current = true;
    }
  }, [ratesData]);

  // Load forecast into edit fields when forecasts change or period tab changes
  useEffect(() => {
    if (forecasts && forecasts[forecastPeriod]) {
      if (lastLoadedForecastPeriodRef.current !== forecastPeriod) {
        const fc = forecasts[forecastPeriod];
        setForecastTitle(fc.title || (forecastPeriod === '1_week' ? 'আগামী ১ সপ্তাহের সোনার বাজার গতিপ্রকৃতি' : 'আগামী ১ মাসের সোনার বাজার গতিপ্রকৃতি'));
        setForecastMin(fc.expectedMin22kBhori ? fc.expectedMin22kBhori.toString() : '138000');
        setForecastMax(fc.expectedMax22kBhori ? fc.expectedMax22kBhori.toString() : '146000');
        setForecastTrend(fc.trend || 'bullish');
        setForecastAdvice(fc.advice || '');
        setForecastNote(fc.adminNote || '');
        lastLoadedForecastPeriodRef.current = forecastPeriod;
      }
    }
  }, [forecasts, forecastPeriod]);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      const data = await res.json();
      setIsLoggingIn(false);

      if (data.success) {
        localStorage.setItem('bd_gold_admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        setPinError(data.message || 'ভুল পিন কোড প্রদান করেছেন।');
      }
    } catch (err) {
      setIsLoggingIn(false);
      setPinError('সার্ভারে যোগাযোগ করা যায়নি।');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('bd_gold_admin_token');
    setIsAuthenticated(false);
  };

  // Update User Access Status
  const handleUpdateUserStatus = async (userId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      const res = await fetch('/api/admin/users/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
        onRefreshAll();
      }
    } catch (e) {
      console.error('Failed to update user status:', e);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই ইউজারের পেমেন্ট এনট্রি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (e) {
      console.error('Failed to delete user:', e);
    }
  };

  // Save Custom Gold Rates
  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRates(true);
    setRateSuccessMsg('');

    try {
      const res = await fetch('/api/admin/update-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clearOverride24k: useAutoUsdCalc || !override24k,
          customOverride24k: (!useAutoUsdCalc && override24k) ? parseFloat(override24k) : undefined,
          usdToBdt: usdRate ? parseFloat(usdRate) : undefined,
          goldUsdPerOz: goldUsdOz ? parseFloat(goldUsdOz) : undefined
        })
      });
      const data = await res.json();
      setIsSavingRates(false);
      if (data.success) {
        setRateSuccessMsg(data.message || 'স্বর্ণের রেট সফলভাবে আপডেট করা হয়েছে!');
        onRefreshAll();
        setTimeout(() => setRateSuccessMsg(''), 4000);
      }
    } catch (e) {
      setIsSavingRates(false);
    }
  };

  // Save Forecast
  const handleSaveForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingForecast(true);
    setForecastSuccessMsg('');

    try {
      const res = await fetch('/api/admin/update-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: forecastPeriod,
          title: forecastTitle,
          expectedMin22kBhori: parseFloat(forecastMin),
          expectedMax22kBhori: parseFloat(forecastMax),
          trend: forecastTrend,
          advice: forecastAdvice,
          adminNote: forecastNote
        })
      });
      const data = await res.json();
      setIsSavingForecast(false);
      if (data.success) {
        setForecastSuccessMsg(data.message || 'পূর্বাভাস সফলভাবে লাইভ আপডেট করা হয়েছে!');
        onRefreshAll();
        setTimeout(() => setForecastSuccessMsg(''), 4000);
      }
    } catch (e) {
      setIsSavingForecast(false);
    }
  };

  // Publish Free Fire Bet Signal
  const handlePublishFreeFire = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFf(true);
    setFfSuccessMsg('');

    try {
      const res = await fetch('/api/admin/update-freefire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ffTitle || 'Free Fire Signal',
          category: ffCategory || 'Gold Trading Signal',
          targetPrice: ffTarget || '১৪৬,০০০ টাকা/ভরি',
          signalType: ffType,
          winOdds: ffOdds || '90%',
          description: ffDesc || 'মার্কেট এনালাইসিস অনুযায়ী ট্রেড সিগন্যাল।'
        })
      });
      const data = await res.json();
      setIsSavingFf(false);
      if (data.success) {
        setFfSuccessMsg('ফ্রী ফায়ার সিগন্যাল পাবলিশ হয়েছে!');
        setFfTitle('');
        setFfDesc('');
        onRefreshAll();
        setTimeout(() => setFfSuccessMsg(''), 3000);
      }
    } catch (e) {
      setIsSavingFf(false);
    }
  };

  // If not authenticated show Admin Pin Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#18181B] border border-[#27272A] rounded-2xl p-6 space-y-5 shadow-2xl">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#EAB308]/10 border border-[#EAB308]/30 flex items-center justify-center mx-auto text-[#EAB308]">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-white">এডমিন প্যানেল লগইন</h2>
            <p className="text-xs text-[#71717A]">ইউজার পারমিশন ও দাম কন্ট্রোল করতে পিন কোড দিন</p>
            <p className="text-[11px] font-mono text-[#EAB308]">ডিফল্ট এডমিন পিন: 123456</p>
          </div>

          {pinError && (
            <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">এডমিন পিন কোড:</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="যেমন: 123456"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#EAB308]"
                />
                <KeyRound className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-[#EAB308] hover:bg-[#B45309] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#EAB308]/20 transition-all"
            >
              {isLoggingIn ? 'যাচাই হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.userName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.userPhone.includes(userSearch) ||
      u.trxId.toLowerCase().includes(userSearch.toLowerCase());

    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Top Admin Bar */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAB308]/10 border border-[#EAB308]/30 text-[#EAB308] text-xs font-bold uppercase">
                ADMIN MASTER PANEL
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
              ইউজার পারমিশন ও রেট কন্ট্রোল সেন্টার
            </h2>
          </div>

          <button
            onClick={handleAdminLogout}
            className="px-3.5 py-2 bg-[#121214] hover:bg-[#212124] text-[#EF4444] border border-[#27272A] font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            লগআউট
          </button>
        </div>

        {/* Admin Navigation Subtabs */}
        <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-xl border border-[#27272A] overflow-x-auto">
          <button
            onClick={() => setAdminTab('users')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              adminTab === 'users' ? 'bg-[#EAB308] text-black shadow-md' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ইউজার পারমিশন ({users.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('rates')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              adminTab === 'rates' ? 'bg-[#EAB308] text-black shadow-md' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>স্বর্ণের রেট সেটিং</span>
          </button>

          <button
            onClick={() => setAdminTab('forecasts')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              adminTab === 'forecasts' ? 'bg-[#EAB308] text-black shadow-md' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>পূর্বাভাস আপডেট</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Users & Payment Permissions */}
      {adminTab === 'users' && (
        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#EAB308]" />
              সাবস্ক্রিপশন ও পেমেন্ট অনুমোদন তালিকা
            </h3>

            {/* Refresh */}
            <button
              onClick={fetchUsers}
              disabled={isLoadingUsers}
              className="p-2 bg-[#121214] hover:bg-[#212124] text-[#EAB308] border border-[#27272A] rounded-xl text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative col-span-2">
              <input
                type="text"
                placeholder="নাম, ফোন নম্বর বা TrxID দিয়ে খুঁজুন..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#EAB308]"
              />
              <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#EAB308]"
            >
              <option value="all">সকল পেমেন্ট স্ট্যাটাস</option>
              <option value="pending">পেন্ডিং (Pending)</option>
              <option value="approved">অনুমোদিত (Approved)</option>
              <option value="rejected">বাতিল (Rejected)</option>
            </select>
          </div>

          {/* Users List Table */}
          <div className="overflow-x-auto rounded-xl border border-[#27272A] bg-[#121214]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#27272A] bg-[#18181B] text-[#A1A1AA] font-semibold">
                  <th className="p-3">ইউজার নাম ও মোবাইল</th>
                  <th className="p-3">পেমেন্ট মাধ্যম</th>
                  <th className="p-3">TrxID / পরিমাণ</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">পারমিশন অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] font-mono text-[#E4E4E7]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-[#71717A]">
                      কোন ইউজার বা পেমেন্ট রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#18181B]/50 transition-colors">
                      <td className="p-3">
                        <div className="font-sans font-bold text-white">{u.userName}</div>
                        <div className="text-[11px] text-[#EAB308] font-mono">{u.userPhone}</div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-[#18181B] border border-[#27272A] rounded text-[11px] font-sans text-[#A1A1AA]">
                          {u.method === 'bkash_personal' ? 'bKash Personal' : u.method === 'nagad_personal' ? 'Nagad Personal' : 'Nagad Agent'}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-mono font-bold text-[#E4E4E7]">{u.trxId}</div>
                        <div className="text-[10px] text-[#71717A]">৳ {u.amount} (মাসিক)</div>
                      </td>

                      <td className="p-3">
                        {u.status === 'approved' ? (
                          <span className="px-2.5 py-0.5 bg-[#22C55E]/20 border border-[#22C55E]/40 text-[#22C55E] font-bold rounded-full text-[10px] inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            অনুমোদিত
                          </span>
                        ) : u.status === 'pending' ? (
                          <span className="px-2.5 py-0.5 bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#EAB308] font-bold rounded-full text-[10px] inline-flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            পেন্ডিং
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] font-bold rounded-full text-[10px] inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            বাতিল
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          {u.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, 'approved')}
                              className="px-2.5 py-1 bg-[#22C55E] hover:bg-[#16a34a] text-black font-bold text-[11px] rounded-lg transition-colors"
                            >
                              অনুমোদন
                            </button>
                          )}

                          {u.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, 'rejected')}
                              className="px-2.5 py-1 bg-[#EAB308] hover:bg-[#B45309] text-black font-bold text-[11px] rounded-lg transition-colors"
                            >
                              ব্লক করুন
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 text-[#71717A] hover:text-[#EF4444] rounded-lg hover:bg-[#18181B] transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Custom Gold Rates */}
      {adminTab === 'rates' && (
        <form onSubmit={handleSaveRates} className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#27272A] pb-2">
            <DollarSign className="w-4 h-4 text-[#EAB308]" />
            স্বর্ণের ভিত্তিমূল্য ও মার্জিন কন্ট্রোল
          </h3>

          {rateSuccessMsg && (
            <div className="p-3 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl text-[#22C55E] text-xs">
              {rateSuccessMsg}
            </div>
          )}

          <div className="p-3 bg-[#0A0A0B] border border-[#27272A] rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoUsdCalc"
                checked={useAutoUsdCalc}
                onChange={(e) => {
                  setUseAutoUsdCalc(e.target.checked);
                  if (e.target.checked) setOverride24k('');
                }}
                className="w-4 h-4 accent-[#EAB308] rounded cursor-pointer"
              />
              <label htmlFor="autoUsdCalc" className="text-xs font-bold text-white cursor-pointer">
                ডলার রেট (USD/BDT) ও আন্তর্জাতিক স্পট ($/Oz) দিয়ে স্বয়ংক্রিয় ২৪কে, ২২কে, ২১কে, ১৮কে ও সনাতন দর হিসাব করুন (সুপারিশকৃত)
              </label>
            </div>
            <p className="text-[11px] text-[#A1A1AA] pl-6">
              ডলার রেট পরিবর্তন করা মাত্রই ২৪কে, ২২কে, ২১কে, ১৮কে এবং সনাতন ক্যাটাগরির নতুন ও পুরাতন সব দর স্বয়ংক্রিয়ভাবে গাণিতিক আনুপাতিক হারে আপডেট হয়ে যাবে।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">
                USD to BDT এক্সচেঞ্জ রেট (টাকা/ডলার)*:
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="যেমন: 122.5"
                value={usdRate}
                onChange={(e) => {
                  setUsdRate(e.target.value);
                  setUseAutoUsdCalc(true);
                  setOverride24k('');
                }}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#EAB308]"
              />
              <span className="text-[10px] text-[#71717A] block">
                এই ডলার রেট পরিবর্তনের সাথে সাথে সকল ক্যারেটের নতুন ও পুরাতন দর আপডেট হবে।
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">
                আন্তর্জাতিক গোল্ড স্পট ($/Oz)*:
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="যেমন: 2750.0"
                value={goldUsdOz}
                onChange={(e) => {
                  setGoldUsdOz(e.target.value);
                  setUseAutoUsdCalc(true);
                  setOverride24k('');
                }}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#EAB308]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">
                ২৪ ক্যারেট ম্যানুয়াল দাম (ঐচ্ছিক Override):
              </label>
              <input
                type="number"
                disabled={useAutoUsdCalc}
                placeholder={useAutoUsdCalc ? "ডলার রেট দিয়ে অটো আপডেট চালু আছে" : "যেমন: 158500"}
                value={override24k}
                onChange={(e) => {
                  setOverride24k(e.target.value);
                  if (e.target.value) setUseAutoUsdCalc(false);
                }}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#EAB308] disabled:opacity-40"
              />
              <span className="text-[10px] text-[#71717A] block">
                ম্যানুয়াল ফিক্সড দর না বসাতে চাইলে এটি খালি বা অফ রাখুন।
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingRates}
            className="px-5 py-2.5 bg-[#EAB308] hover:bg-[#B45309] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#EAB308]/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingRates ? 'সংরক্ষণ হচ্ছে...' : 'রেট সেটিংস সেভ করুন ও অল রেট অটো আপডেট করুন'}</span>
          </button>
        </form>
      )}

      {/* Tab 3: Forecast Manager */}
      {adminTab === 'forecasts' && (
        <form onSubmit={handleSaveForecast} className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#27272A] pb-3 gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#EAB308]" />
                অগ্রিম বাজার পূর্বাভাস এডিটর (Market Forecast Manager)
              </h3>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                এখান থেকে যা আপডেট করবেন তা সাধারণ ব্যবহারকারীরা 'পূর্বাভাস' ট্যাবে দেখতে পাবে।
              </p>
            </div>

            {/* Select Forecast Period */}
            <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-lg border border-[#27272A] shrink-0">
              <button
                type="button"
                onClick={() => setForecastPeriod('1_week')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                  forecastPeriod === '1_week' ? 'bg-[#EAB308] text-black shadow-sm' : 'text-[#71717A] hover:text-[#E4E4E7]'
                }`}
              >
                ১ সপ্তাহ (Short Term)
              </button>
              <button
                type="button"
                onClick={() => setForecastPeriod('1_month')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                  forecastPeriod === '1_month' ? 'bg-[#EAB308] text-black shadow-sm' : 'text-[#71717A] hover:text-[#E4E4E7]'
                }`}
              >
                ১ মাস (Medium Term)
              </button>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="bg-[#121214] border border-[#27272A] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#EAB308] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              দ্রুত টেমপ্লেট নির্বাচন করুন (Quick Fill):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setForecastTrend('bullish');
                  setForecastTitle(forecastPeriod === '1_week' ? 'আগামী ১ সপ্তাহের বুলিশ মার্কেট ট্রেন্ড' : 'আগামী ১ মাসের বুলিশ মার্কেট ট্রেন্ড');
                  setForecastAdvice('বিশ্ববাজারে মুদ্রাস্ফীতি ও সুদের হারের ইঙ্গিতে স্বর্ণের দাম বৃদ্ধির উচ্চ সম্ভাবনা রয়েছে। নতুন স্টক কেনার ক্ষেত্রে সুবিধাজনক ডিপস বেছে নিন।');
                  setForecastNote('ফেড পলিসি, ইউএস ডলার দুর্বলতা ও ভূ-রাজনৈতিক উত্তেজনার কারণে বুলিশ ট্রেন্ড অব্যাহত।');
                }}
                className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-lg hover:bg-emerald-500/30 transition-all"
              >
                📈 বুলিশ টেমপ্লেট
              </button>
              <button
                type="button"
                onClick={() => {
                  setForecastTrend('bearish');
                  setForecastTitle(forecastPeriod === '1_week' ? 'আগামী ১ সপ্তাহের বিয়ারিশ মার্কেট সংশোধন' : 'আগামী ১ মাসের বিয়ারিশ সংশোধন পূর্বাভাস');
                  setForecastAdvice('আন্তর্জাতিক বাজারে মুনাফা তোলার কারণে সাময়িক দরপতনের সম্ভাবনা রয়েছে। তাড়াহুড়ো না করে বাজার কিছুটা থিতু হওয়া পর্যন্ত অপেক্ষা করুন।');
                  setForecastNote('ইউএস ডলার শক্তিশালী হওয়া ও ট্রেজারি বন্ড ইল্ড বৃদ্ধির প্রভাবে বিয়ারিশ চাপ পরিলক্ষিত।');
                }}
                className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-xs rounded-lg hover:bg-rose-500/30 transition-all"
              >
                📉 বিয়ারিশ টেমপ্লেট
              </button>
              <button
                type="button"
                onClick={() => {
                  setForecastTrend('stable');
                  setForecastTitle(forecastPeriod === '1_week' ? 'আগামী ১ সপ্তাহের স্থিতিশীল বাজার সমীকরণ' : 'আগামী ১ মাসের সাইডওয়ে স্থিতিশীল রেঞ্জ');
                  setForecastAdvice('সোনার দর একটি নির্দিষ্ট সীমার মধ্যে ওঠানামা করার সম্ভাবনা রয়েছে। চাহিদানুযায়ী ব্যালেন্সড ইনভেন্টরি বজায় রাখুন।');
                  setForecastNote('আন্তর্জাতিক কেন্দ্রীয় ব্যাংকগুলোর পলিসি সিদ্ধান্তের অপেক্ষায় বাজার একটি ন্যারো রেঞ্জে রয়েছে।');
                }}
                className="px-2.5 py-1 bg-sky-500/20 border border-sky-500/40 text-sky-400 font-bold text-xs rounded-lg hover:bg-sky-500/30 transition-all"
              >
                ⚖️ স্থিতিশীল টেমপ্লেট
              </button>
            </div>
          </div>

          {forecastSuccessMsg && (
            <div className="p-3 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl text-[#22C55E] text-xs font-bold">
              {forecastSuccessMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#A1A1AA]">পূর্বাভাস শিরোনাম (Title)*:</label>
            <input
              type="text"
              required
              value={forecastTitle}
              onChange={(e) => setForecastTitle(e.target.value)}
              placeholder="যেমন: আগামী ১ সপ্তাহের সোনার বাজার গতিপ্রকৃতি"
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#EAB308]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">২২কে সর্বনিম্ন সম্ভাব্য দাম (টাকা/ভরি)*:</label>
              <input
                type="number"
                required
                value={forecastMin}
                onChange={(e) => setForecastMin(e.target.value)}
                placeholder="যেমন: 138000"
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#EAB308]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">২২কে সর্বোচ্চ সম্ভাব্য দাম (টাকা/ভরি)*:</label>
              <input
                type="number"
                required
                value={forecastMax}
                onChange={(e) => setForecastMax(e.target.value)}
                placeholder="যেমন: 146000"
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#EAB308]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#A1A1AA]">মার্কেট ট্রেন্ড দিকনির্দেশনা (Trend)*:</label>
              <select
                value={forecastTrend}
                onChange={(e) => setForecastTrend(e.target.value as any)}
                className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#EAB308]"
              >
                <option value="bullish">Bullish 📈 (দাম বৃদ্ধির সম্ভাবনা)</option>
                <option value="bearish">Bearish 📉 (দাম কমার সম্ভাবনা)</option>
                <option value="stable">Stable ⚖️ (স্থিতিশীল বাজার)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#A1A1AA]">ব্যবসায়ীদের জন্য ট্রেডিং স্ট্র্যাটেজি পরামর্শ (Trading Strategy)*:</label>
            <textarea
              rows={2}
              required
              value={forecastAdvice}
              onChange={(e) => setForecastAdvice(e.target.value)}
              placeholder="ব্যবসায়ীদের কী করা উচিত সে বিষয়ে দিকনির্দেশনা লিখুন"
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#EAB308]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#A1A1AA]">এডমিন বাজার এনালাইসিস নোট (Analysis Rationale)*:</label>
            <textarea
              rows={2}
              required
              value={forecastNote}
              onChange={(e) => setForecastNote(e.target.value)}
              placeholder="আন্তর্জাতিক অর্থনৈতিক ও মুদ্রাস্ফীতির কারণ বিশ্লেষণ করুন"
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-[#EAB308]"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingForecast}
            className="px-5 py-2.5 bg-[#EAB308] hover:bg-[#B45309] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#EAB308]/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingForecast ? 'আপডেট হচ্ছে...' : 'পূর্বাভাস সেভ ও লাইভ প্রকাশ করুন'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
