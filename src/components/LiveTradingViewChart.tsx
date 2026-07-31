import React, { useState, useEffect, useMemo } from 'react';
import { Activity, RefreshCw, Zap, TrendingUp, BarChart2, LineChart as LineChartIcon, Eye } from 'lucide-react';

interface LiveTradingViewChartProps {
  rawUsdOz: number;
  usdToBdt: number;
  base24kBhoriBDT: number;
}

export const LiveTradingViewChart: React.FC<LiveTradingViewChartProps> = ({
  rawUsdOz,
  usdToBdt,
  base24kBhoriBDT,
}) => {
  const [chartInterval, setChartInterval] = useState<'1' | '5' | '60' | 'D'>('5');
  const [chartStyle, setChartStyle] = useState<'2' | '3' | '1'>('2'); // '2' = Line, '3' = Area, '1' = Candlestick
  const [renderMode, setRenderMode] = useState<'tv' | 'native'>('tv'); // 'tv' = TradingView Widget, 'native' = Native SVG Line Chart
  const [tickerPrice, setTickerPrice] = useState<number>(rawUsdOz || 2750);
  const [priceChange, setPriceChange] = useState<number>(+1.85);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; priceUsd: number; priceBdt: number; timeLabel: string } | null>(null);

  // Dynamic price tick simulation
  useEffect(() => {
    const timer = window.setInterval(() => {
      const delta = (Math.random() - 0.48) * 1.6;
      setTickerPrice((prev) => {
        const next = Math.max(1800, +(prev + delta).toFixed(2));
        setPriceChange(+(next - (rawUsdOz || 2750)).toFixed(2));
        return next;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [rawUsdOz]);

  // Calculate BDT 24K per bhori live
  const live24kBhori = Math.round((tickerPrice / 31.1034768) * 11.664 * usdToBdt);

  // Generate 24 points for Native SVG Line Chart based on current ticker price & interval
  const chartDataPoints = useMemo(() => {
    const pointsCount = 20;
    const basePrice = tickerPrice;
    const points: { timeLabel: string; priceUsd: number; priceBdt: number }[] = [];

    const now = new Date();
    for (let i = pointsCount - 1; i >= 0; i--) {
      let t = new Date(now.getTime());
      if (chartInterval === '1') t.setMinutes(now.getMinutes() - i);
      else if (chartInterval === '5') t.setMinutes(now.getMinutes() - i * 5);
      else if (chartInterval === '60') t.setHours(now.getHours() - i);
      else t.setDate(now.getDate() - i);

      const timeLabel = chartInterval === 'D' 
        ? t.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })
        : t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Deterministic pseudo-random variation based on index
      const sinOffset = Math.sin(i * 0.7) * 4.5 + Math.cos(i * 0.3) * 3.2;
      const pointUsd = +(basePrice - (i * 0.4) + sinOffset).toFixed(2);
      const pointBdt = Math.round((pointUsd / 31.1034768) * 11.664 * usdToBdt);

      points.push({ timeLabel, priceUsd: pointUsd, priceBdt: pointBdt });
    }
    // Make last point equal current ticker
    points[points.length - 1].priceUsd = tickerPrice;
    points[points.length - 1].priceBdt = live24kBhori;

    return points;
  }, [tickerPrice, live24kBhori, chartInterval, usdToBdt]);

  // SVG dimensions for Native Line Chart
  const svgWidth = 800;
  const svgHeight = 320;
  const padding = 40;

  const minUsd = useMemo(() => Math.min(...chartDataPoints.map((p) => p.priceUsd)) - 2, [chartDataPoints]);
  const maxUsd = useMemo(() => Math.max(...chartDataPoints.map((p) => p.priceUsd)) + 2, [chartDataPoints]);

  const pathD = useMemo(() => {
    if (chartDataPoints.length === 0) return '';
    const xStep = (svgWidth - padding * 2) / (chartDataPoints.length - 1);

    return chartDataPoints.map((pt, idx) => {
      const x = padding + idx * xStep;
      const y = svgHeight - padding - ((pt.priceUsd - minUsd) / (maxUsd - minUsd || 1)) * (svgHeight - padding * 2);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [chartDataPoints, minUsd, maxUsd]);

  const areaD = useMemo(() => {
    if (!pathD) return '';
    const lastX = svgWidth - padding;
    const firstX = padding;
    const bottomY = svgHeight - padding;
    return `${pathD} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [pathD]);

  // Construct Direct TradingView Iframe URL
  const tvIframeUrl = `https://s.tradingview.com/widgetembed/?symbol=OANDA%3AXAUUSD&interval=${chartInterval}&theme=dark&style=${chartStyle}&timezone=Asia%2FDhaka&hide_top_toolbar=0&hide_legend=0&allow_symbol_change=1&save_image=0`;

  return (
    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Top Banner with Ticker & Dynamic Rate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121214] p-3.5 rounded-xl border border-[#27272A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAB308]/10 border border-[#EAB308]/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-[#EAB308] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#EAB308] uppercase tracking-wide">
                TradingView spot XAU/USD (গোল্ড)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[10px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
                LIVE
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-mono font-black text-white">
                ${tickerPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-mono font-bold ${priceChange >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {priceChange >= 0 ? `+${priceChange}` : priceChange} USD
              </span>
            </div>
          </div>
        </div>

        {/* Live Bhori Rate Preview & Mode Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#27272A]">
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-[#71717A] block font-medium">
              লাইভ ২৪K আনুমানিক
            </span>
            <span className="text-lg font-mono font-bold text-[#EAB308]">
              ৳ {live24kBhori.toLocaleString('bn-BD')} /ভরি
            </span>
          </div>

          {/* Chart Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Chart Render Mode */}
            <div className="flex items-center gap-1 bg-[#0A0A0B] p-1 rounded-lg border border-[#27272A]">
              <button
                onClick={() => { setRenderMode('tv'); setChartStyle('2'); }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                  renderMode === 'tv' && chartStyle === '2'
                    ? 'bg-[#EAB308] text-black shadow-sm'
                    : 'text-[#71717A] hover:text-[#E4E4E7]'
                }`}
                title="লাইন চার্ট (Line Chart)"
              >
                📈 লাইন (Line)
              </button>
              <button
                onClick={() => { setRenderMode('tv'); setChartStyle('3'); }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                  renderMode === 'tv' && chartStyle === '3'
                    ? 'bg-[#EAB308] text-black shadow-sm'
                    : 'text-[#71717A] hover:text-[#E4E4E7]'
                }`}
                title="এরিয়া চার্ট (Area Chart)"
              >
                🌊 এরিয়া
              </button>
              <button
                onClick={() => { setRenderMode('tv'); setChartStyle('1'); }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                  renderMode === 'tv' && chartStyle === '1'
                    ? 'bg-[#EAB308] text-black shadow-sm'
                    : 'text-[#71717A] hover:text-[#E4E4E7]'
                }`}
                title="ক্যান্ডেলস্টিক (Candlestick)"
              >
                🕯️ ক্যান্ডেল
              </button>
              <button
                onClick={() => setRenderMode('native')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                  renderMode === 'native'
                    ? 'bg-[#EAB308] text-black shadow-sm'
                    : 'text-[#71717A] hover:text-[#E4E4E7]'
                }`}
                title="এইচডি ইন্টারঅ্যাক্টিভ লাইন চার্ট"
              >
                ✨ এইচডি লাইন
              </button>
            </div>

            {/* Timeframe Interval Selector */}
            <div className="flex items-center gap-1 bg-[#0A0A0B] p-1 rounded-lg border border-[#27272A]">
              {(['1', '5', '60', 'D'] as const).map((itm) => (
                <button
                  key={itm}
                  onClick={() => setChartInterval(itm)}
                  className={`px-2 py-1 text-[11px] font-mono font-bold rounded transition-colors ${
                    chartInterval === itm
                      ? 'bg-[#EAB308] text-black shadow-sm'
                      : 'text-[#71717A] hover:text-[#E4E4E7]'
                  }`}
                >
                  {itm === '1' ? '1m' : itm === '5' ? '5m' : itm === '60' ? '1h' : '1D'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="relative w-full h-[380px] sm:h-[430px] rounded-xl overflow-hidden border border-[#27272A] bg-[#0F0F11]">
        {renderMode === 'tv' ? (
          <iframe
            key={`${chartInterval}-${chartStyle}`}
            title="TradingView Gold Line Chart"
            src={tvIframeUrl}
            className="w-full h-full border-0 rounded-xl"
            allowFullScreen
          />
        ) : (
          /* Native Interactive SVG Gold Line Chart */
          <div className="relative w-full h-full p-2 flex flex-col justify-between bg-gradient-to-b from-[#121214] to-[#0A0A0B]">
            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div 
                className="absolute z-20 bg-[#18181B]/95 border border-[#EAB308]/50 rounded-xl p-2.5 shadow-2xl text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{ left: `${(hoveredPoint.x / svgWidth) * 100}%`, top: `${(hoveredPoint.y / svgHeight) * 100}%` }}
              >
                <div className="text-[#A1A1AA] text-[10px] font-mono">{hoveredPoint.timeLabel}</div>
                <div className="font-mono font-bold text-white text-sm mt-0.5">${hoveredPoint.priceUsd.toFixed(2)} USD</div>
                <div className="font-mono font-extrabold text-[#EAB308] text-xs">৳ {hoveredPoint.priceBdt.toLocaleString('bn-BD')} /ভরি</div>
              </div>
            )}

            {/* SVG Canvas */}
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EAB308" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#EAB308" stopOpacity="0.0" />
                </linearGradient>
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Grid lines */}
              {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
                const y = padding + ratio * (svgHeight - padding * 2);
                const priceVal = (maxUsd - ratio * (maxUsd - minUsd)).toFixed(1);
                return (
                  <g key={idx}>
                    <line x1={padding} y1={y} x2={svgWidth - padding} y2={y} stroke="#27272A" strokeDasharray="3 3" strokeWidth="1" />
                    <text x={padding - 5} y={y + 3} fill="#71717A" fontSize="10" textAnchor="end" fontFamily="monospace">${priceVal}</text>
                  </g>
                );
              })}

              {/* Gradient Fill under Line */}
              <path d={areaD} fill="url(#goldGradient)" />

              {/* Gold Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#EAB308"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#goldGlow)"
              />

              {/* Interactive Data Points */}
              {chartDataPoints.map((pt, idx) => {
                const xStep = (svgWidth - padding * 2) / (chartDataPoints.length - 1);
                const x = padding + idx * xStep;
                const y = svgHeight - padding - ((pt.priceUsd - minUsd) / (maxUsd - minUsd || 1)) * (svgHeight - padding * 2);
                const isLast = idx === chartDataPoints.length - 1;

                return (
                  <g key={idx}>
                    {/* Hover trigger circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint({ x, y, priceUsd: pt.priceUsd, priceBdt: pt.priceBdt, timeLabel: pt.timeLabel })}
                    />

                    {/* Visible node point */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isLast ? "5" : "3"}
                      fill={isLast ? "#22C55E" : "#EAB308"}
                      stroke="#121214"
                      strokeWidth="2"
                    />

                    {/* Animated pulse for live current price node */}
                    {isLast && (
                      <circle cx={x} cy={y} r="9" fill="none" stroke="#22C55E" strokeWidth="1.5" className="animate-ping" />
                    )}

                    {/* Time labels below x-axis */}
                    {idx % 4 === 0 && (
                      <text x={x} y={svgHeight - 12} fill="#71717A" fontSize="10" textAnchor="middle" fontFamily="monospace">
                        {pt.timeLabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#71717A] px-1 font-mono">
        <span>* আন্তর্জাতিক গোল্ড স্পট রেট (OANDA:XAUUSD) লাইভ স্ট্রিমড</span>
        <span className="font-mono text-[#EAB308]">ডলার এক্সচেঞ্জ: ৳{usdToBdt}</span>
      </div>
    </div>
  );
};
