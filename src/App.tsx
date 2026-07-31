import React, { useState, useEffect } from 'react';
import { GoldRatesResponse, ForecastItem, UserPayment } from './types';
import { PaywallGate } from './components/PaywallGate';
import { Navbar } from './components/Navbar';
import { GoldRateBoard } from './components/GoldRateBoard';
import { LiveTradingViewChart } from './components/LiveTradingViewChart';
import { ForecastSection } from './components/ForecastSection';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  // User Payment Authorization State
  const [currentUser, setCurrentUser] = useState<UserPayment | null>(() => {
    try {
      const saved = localStorage.getItem('bd_gold_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user:', e);
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('board');
  const [ratesData, setRatesData] = useState<GoldRatesResponse | null>(null);
  const [forecasts, setForecasts] = useState<Record<string, ForecastItem> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch Gold Rates
  const fetchGoldRates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gold-rates');
      const data = await res.json();
      if (data.success && data.data) {
        setRatesData(data.data);
        setLastUpdated(data.lastUpdated || new Date().toISOString());
      }
    } catch (e) {
      console.error('Error fetching gold rates:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Forecasts
  const fetchForecasts = async () => {
    try {
      const res = await fetch('/api/forecasts');
      const data = await res.json();
      if (data.success && data.forecasts) {
        setForecasts(data.forecasts);
      }
    } catch (e) {
      console.error('Error fetching forecasts:', e);
    }
  };

  const refreshAllData = () => {
    fetchGoldRates();
    fetchForecasts();
  };

  // On initial mount or login fetch data
  useEffect(() => {
    refreshAllData();
    // Live real-time polling every 4 seconds for instant sync when Admin updates rates or USD price
    const interval = setInterval(() => {
      refreshAllData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle successful paywall unlock
  const handleUnlockSuccess = (user: UserPayment) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('bd_gold_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user session:', e);
    }
  };

  // Logout / Reset session
  const handleUserLogout = () => {
    localStorage.removeItem('bd_gold_user');
    setCurrentUser(null);
  };

  // Paywall Access Check
  if (!currentUser) {
    return <PaywallGate onUnlockSuccess={handleUnlockSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] flex flex-col font-sans pb-20 md:pb-8 overflow-x-hidden selection:bg-[#EAB308]/20 selection:text-[#EAB308]">
      {/* Top Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={currentUser}
        onLogout={handleUserLogout}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 space-y-6">
        {activeTab === 'board' && (
          <GoldRateBoard
            ratesData={ratesData?.rates || null}
            lastUpdated={lastUpdated}
            onRefresh={refreshAllData}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'chart' && (
          <LiveTradingViewChart
            rawUsdOz={ratesData?.rawUsdOz || 2750}
            usdToBdt={ratesData?.usdToBdt || 122.5}
            base24kBhoriBDT={ratesData?.base24kBhoriBDT || 158500}
          />
        )}

        {activeTab === 'forecast' && (
          <ForecastSection forecasts={forecasts} />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            ratesData={ratesData}
            forecasts={forecasts}
            onRefreshAll={refreshAllData}
          />
        )}
      </main>

      {/* Elegant Dark Theme Status Bar Footer */}
      <footer className="bg-[#121214] border-t border-[#27272A] px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#71717A] gap-2 mt-auto font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block animate-pulse" />
          <span>ইউজার কন্ট্রোল: একটিভ | পারমিশন: ফুল এক্সেস</span>
        </div>
        <div>
          <span>হোস্টিং স্ট্যাটাস: ক্লাউড কানেক্টেড (TradingView Feed)</span>
        </div>
        <div>
          <span>সার্ভার টাইম: {new Date().toLocaleTimeString('bn-BD')} (GMT+6)</span>
        </div>
      </footer>
    </div>
  );
}
