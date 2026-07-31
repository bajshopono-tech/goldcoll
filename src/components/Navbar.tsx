import React from 'react';
import { Layers, Activity, Calendar, Shield, LogOut, CheckCircle } from 'lucide-react';
import { UserPayment } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserPayment | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
}) => {
  const isAdminAuthenticated = localStorage.getItem('bd_gold_admin_token') === 'admin-authenticated-token';
  const [clickCount, setClickCount] = React.useState(0);

  const handleSecretClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setActiveTab('admin');
        return 0;
      }
      return next;
    });
  };

  // Base public nav items - Admin is strictly hidden from general view unless authenticated or active
  const baseNavItems = [
    { id: 'board', label: 'লাইভ রেট', icon: Layers },
    { id: 'chart', label: 'ট্রেডিংভিউ', icon: Activity },
    { id: 'forecast', label: 'পূর্বাভাস', icon: Calendar },
  ];

  const navItems = (activeTab === 'admin' || isAdminAuthenticated)
    ? [...baseNavItems, { id: 'admin', label: 'এডমিন', icon: Shield }]
    : baseNavItems;

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#121214] border-b border-[#27272A] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#EAB308] to-[#B45309] flex items-center justify-center font-black text-black shadow-md shadow-[#EAB308]/20 text-lg shrink-0 select-none">
              Au
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-[#EAB308] tracking-tight leading-none">
                  GOLD ANALYTICS
                </h1>
                <span
                  onClick={handleSecretClick}
                  className="text-[11px] font-normal text-[#71717A] hover:text-[#A1A1AA] font-mono cursor-pointer transition-colors select-none"
                  title="v4.2"
                >
                  v4.2
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5 font-medium line-clamp-1">
                ২৪K • ২২K • ২১K • ১৮K • সনাতন লাইভ রেট বিশ্লেষণ
              </p>
            </div>
          </div>

          {/* Right Header Controls & Status Badges */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#E4E4E7] font-medium">
              <span className="w-2 h-2 bg-[#EF4444] rounded-full inline-block animate-ping" />
              <span className="text-[#A1A1AA]">লাইভ ট্রেডিংভিউ কানেক্টেড</span>
            </div>

            <div className="bg-gradient-to-r from-[#EAB308] to-[#B45309] text-black font-extrabold text-[10px] px-2.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
              PREMIUM ACCESS
            </div>

            {user && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-[#22C55E] text-[11px] font-semibold">
                <CheckCircle className="w-3 h-3" />
                <span>{user.userName.split(' ')[0]}</span>
              </div>
            )}

            <button
              onClick={onLogout}
              className="p-1.5 text-[#71717A] hover:text-[#EF4444] hover:bg-[#18181B] rounded-xl transition-colors"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Top Desktop Navigation / Sub-Header */}
      <nav className="hidden md:block bg-[#121214] border-b border-[#27272A] px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#EAB308] text-black shadow-md shadow-[#EAB308]/10'
                    : 'text-[#A1A1AA] hover:text-[#E4E4E7] hover:bg-[#18181B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation Bar for Mobile Screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121214]/95 backdrop-blur-lg border-t border-[#27272A] px-2 py-1.5 shadow-2xl">
        <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#EAB308] font-bold bg-[#EAB308]/10'
                    : 'text-[#71717A] hover:text-[#E4E4E7]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#EAB308] scale-110' : ''}`} />
                <span className="text-[10px] tracking-tight truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
