import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geoMercator, geoPath, geoCentroid } from 'd3-geo';
import { DISTRICT_DATA, normalizeDistrictName, getCropImage } from './districtData';
import type { DistrictDetail, CropInfo } from './districtData';
import { 
  MapPin, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Coins, 
  ShoppingCart, 
  Store, 
  Layers, 
  Building2
} from 'lucide-react';

interface APMapProps {
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  onViewListings?: (district: string) => void;
  onSelectPortalMode?: (mode: 'general' | 'farmer' | 'dealer' | 'transport' | 'admin', district?: string) => void;
  currentPortalMode?: 'general' | 'farmer' | 'dealer' | 'transport' | 'admin';
  userRole?: 'farmer' | 'dealer' | 'transport' | 'admin';
}

const DISTRICT_COLORS: Record<string, string> = {
  "Guntur": "#16a34a",
  "Krishna": "#059669",
  "NTR": "#0d9488",
  "West Godavari": "#15803d",
  "East Godavari": "#166534",
  "Konaseema": "#10b981",
  "Kakinada": "#047857",
  "Eluru": "#0f766e",
  "Palnadu": "#15803d",
  "Bapatla": "#22c55e",
  "Prakasam": "#166534",
  "Nellore": "#14532d",
  "Kurnool": "#047857",
  "Nandyal": "#0f766e",
  "Ananthapur": "#15803d",
  "Sri Sathya Sai": "#166534",
  "YSR Kadapa": "#10b981",
  "Annamayya": "#059669",
  "Chittoor": "#14532d",
  "Tirupati": "#16a34a",
  "Visakhapatnam": "#059669",
  "Anakapalli": "#15803d",
  "Vizianagaram": "#10b981",
  "Srikakulam": "#047857",
  "Parvathipuram Manyam": "#166534",
  "Alluri Sitharama Raju": "#14532d"
};

export default function APMap({ 
  selectedDistrict, 
  onSelectDistrict, 
  onViewListings,
  onSelectPortalMode,
  currentPortalMode = 'farmer'
}: APMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [selectedCropIndex, setSelectedCropIndex] = useState<number>(0);

  useEffect(() => {
    fetch('/ap.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          setGeoData(data);
        }
      })
      .catch(console.error);
  }, []);

  const activeDistrictName = hoveredDistrict || selectedDistrict || "Guntur";
  const activeDetail: DistrictDetail = DISTRICT_DATA[normalizeDistrictName(activeDistrictName)] || DISTRICT_DATA["Guntur"];

  // Reset selected crop index when active district changes
  useEffect(() => {
    setSelectedCropIndex(0);
  }, [activeDetail.name]);

  const activeCrop: CropInfo = activeDetail.crops[selectedCropIndex] || activeDetail.crops[0];

  // D3 Projection and Path Generator with exact fitSize to guarantee no blank/clipping
  const { districtFeatures, labelPositions } = useMemo(() => {
    if (!geoData || !geoData.features || geoData.features.length === 0) {
      return { districtFeatures: [], labelPositions: [] };
    }

    const width = 640;
    const height = 540;

    const projection = geoMercator().fitExtent([[30, 30], [width - 30, height - 30]], geoData);
    const pathGen = geoPath().projection(projection);

    const featuresWithData: any[] = [];
    const labels: { name: string; x: number; y: number }[] = [];
    const seenLabels = new Set<string>();

    geoData.features.forEach((feat: any) => {
      if (!feat.geometry || !feat.geometry.coordinates) return;
      const rawName = feat.properties?.district_name || feat.properties?.NEW_DIST || "";
      const normName = normalizeDistrictName(rawName);
      
      const pathD = pathGen(feat);
      if (!pathD) return;

      featuresWithData.push({
        rawName,
        normName,
        pathD,
        feat
      });

      // Calculate label coordinates
      if (normName && !seenLabels.has(normName)) {
        seenLabels.add(normName);
        try {
          const centroidGeo = geoCentroid(feat);
          const projected = projection(centroidGeo);
          if (projected && !isNaN(projected[0]) && !isNaN(projected[1])) {
            labels.push({
              name: normName,
              x: projected[0],
              y: projected[1]
            });
          }
        } catch (e) {
          const [cx, cy] = pathGen.centroid(feat);
          if (!isNaN(cx) && !isNaN(cy)) {
            labels.push({ name: normName, x: cx, y: cy });
          }
        }
      }
    });

    return { districtFeatures: featuresWithData, labelPositions: labels };
  }, [geoData]);

  if (!geoData || districtFeatures.length === 0) {
    return (
      <div className="w-full h-[480px] flex flex-col items-center justify-center bg-emerald-950/5 rounded-3xl border border-emerald-900/10">
        <span className="flex h-5 w-5 relative mb-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-600"></span>
        </span>
        <p className="text-sm font-bold text-emerald-950">Loading Andhra Pradesh Interactive Digital Map...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40 rounded-3xl p-4 md:p-6 border border-emerald-200/80 shadow-sm overflow-hidden">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-900/10">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="text-emerald-700 w-5 h-5" />
            <h3 className="font-extrabold text-emerald-950 text-base md:text-lg">
              Live AP Agricultural Geospatial Hub & Mandi Intelligence
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any district to reveal real-time mandi prices, regional crop suitability, and live profit estimations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-900/10 px-3.5 py-1.5 rounded-full border border-emerald-900/15 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black text-emerald-950">
              Active District: <span className="text-emerald-700 underline">{activeDetail.name}</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-white border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            <Sparkles size={13} className="text-amber-500" />
            <span>26 Districts Live</span>
          </div>
        </div>
      </div>

      {/* Grid: SVG Vector Map + Floating District Crop & Profit Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Full SVG Map (6 cols on lg) */}
        <div className="lg:col-span-6 relative h-[420px] md:h-[540px] flex items-center justify-center bg-gradient-to-br from-emerald-900/5 to-emerald-950/10 rounded-3xl p-2 border border-emerald-900/10 overflow-hidden shadow-inner">
          <svg 
            viewBox="0 0 640 540" 
            className="w-full h-full max-h-[520px] select-none"
            style={{ filter: "drop-shadow(0 12px 24px rgba(4, 120, 87, 0.18))" }}
          >
            <defs>
              <filter id="districtGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render District Polygons */}
            <g>
              {districtFeatures.map((item, idx) => {
                const isSelected = normalizeDistrictName(selectedDistrict) === item.normName;
                const isHovered = hoveredDistrict === item.normName;
                const baseFill = DISTRICT_COLORS[item.normName] || "#059669";

                return (
                  <path
                    key={`${item.normName}-${idx}`}
                    d={item.pathD}
                    fill={isSelected ? "#22c55e" : isHovered ? "#10b981" : baseFill}
                    fillOpacity={isSelected ? 1 : isHovered ? 0.95 : 0.82}
                    stroke={isSelected ? "#ffffff" : "#ffffff"}
                    strokeWidth={isSelected ? 2.8 : isHovered ? 1.8 : 0.9}
                    filter={isSelected ? "url(#districtGlow)" : undefined}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredDistrict(item.normName)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    onClick={() => onSelectDistrict(item.normName)}
                  />
                );
              })}
            </g>

            {/* Render District Labels */}
            <g className="pointer-events-none">
              {labelPositions.map(({ name, x, y }) => {
                const isSelected = normalizeDistrictName(selectedDistrict) === name;
                const keyDistricts = [
                  "Guntur", "Krishna", "West Godavari", "Ananthapur", "Kurnool", 
                  "Nellore", "Prakasam", "YSR Kadapa", "Chittoor", "Visakhapatnam", 
                  "Srikakulam", "East Godavari", "NTR", "Palnadu", "Eluru", "Bapatla"
                ];

                if (!keyDistricts.includes(name) && !isSelected) return null;

                return (
                  <text
                    key={`lbl-${name}`}
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontSize: isSelected ? "11px" : "9px",
                      fontWeight: isSelected ? "800" : "600",
                      fill: "#ffffff",
                      stroke: "rgba(0, 0, 0, 0.65)",
                      strokeWidth: "2.2px",
                      paintOrder: "stroke fill",
                      userSelect: "none"
                    }}
                  >
                    {name}
                  </text>
                );
              })}
            </g>
          </svg>

          {/* Quick interactive hint badge */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[11px] font-semibold text-emerald-950 shadow-md border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Click any AP district on map to inspect</span>
          </div>

          <div className="absolute top-3 right-3 bg-emerald-950/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-700/50">
            Govt. AP Agro-Climatic Zone
          </div>
        </div>

        {/* Right Column: Real-Time Market Prices, Best Crops & Profit Estimator (6 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDetail.name}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_15px_40px_rgba(4,120,87,0.1)] border border-emerald-100 flex flex-col gap-4"
            >
              {/* Card Top: District Title & Regional Soil / Season Meta */}
              <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-2xl font-black text-emerald-950 tracking-tight">
                      {activeDetail.name}
                    </h4>
                    {normalizeDistrictName(selectedDistrict) === normalizeDistrictName(activeDetail.name) ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> Selected
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectDistrict(activeDetail.name)}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-emerald-700 font-bold mt-0.5">
                    {activeDetail.tagline}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                    <Layers size={12} className="text-emerald-600" />
                    {activeDetail.soilType}
                  </span>
                </div>
              </div>

              {/* SECTION: Best Crops in Region with Realtime Prices & Profit Quick View */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={15} className="text-emerald-700" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                      Best Suitable Crops & Real-Time Mandi Prices
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Select crop to view profit analytics
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {activeDetail.crops.map((crop, idx) => {
                    const isSelectedCrop = selectedCropIndex === idx;
                    return (
                      <div
                        key={crop.name}
                        onClick={() => setSelectedCropIndex(idx)}
                        className={`cursor-pointer rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                          isSelectedCrop 
                            ? "bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/30" 
                            : "bg-slate-50/70 border-slate-200/80 hover:bg-emerald-50/30 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 mb-2">
                          <img 
                            src={crop.image || getCropImage(crop.name)} 
                            alt={crop.name}
                            onError={(e) => { e.currentTarget.src = getCropImage(crop.name); }}
                            className="w-12 h-12 rounded-xl object-cover shadow-sm bg-slate-200 shrink-0" 
                            loading="lazy"
                          />
                          <div className="overflow-hidden">
                            <h5 className="text-xs font-black text-slate-900 truncate">
                              {crop.name}
                            </h5>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded inline-block mt-0.5">
                              {crop.suitability}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 pt-1.5 border-t border-slate-200/60 text-xs">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[11px] text-slate-500 font-semibold">Live Mandi:</span>
                            <span className="font-black text-emerald-800 text-sm">{crop.price}</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">Trend / Day:</span>
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                              ↗ {crop.trend}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">Mandi Arrivals:</span>
                            <span className="font-semibold text-slate-800">{crop.arrival}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* REALTIME PROFIT ESTIMATION BREAKDOWN CARD (For Selected Crop) */}
              <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-2xl p-4 shadow-md border border-emerald-800/60 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Coins className="text-amber-400 w-4 h-4" />
                    <div>
                      <h5 className="text-xs font-black text-white tracking-wide uppercase">
                        Real-Time Profit Estimation ({activeCrop.name})
                      </h5>
                      <span className="text-[10px] text-emerald-300 font-medium">
                        Based on {activeCrop.mandiName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-200 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    ROI: {activeCrop.roi}
                  </span>
                </div>

                {/* 3-Column Profit Metric Grid */}
                <div className="grid grid-cols-3 gap-2 text-center my-2">
                  <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                    <span className="text-[10px] text-emerald-200 block">Avg Yield / Acre</span>
                    <span className="text-xs font-extrabold text-white mt-0.5 block truncate">
                      {activeCrop.yieldPerAcre.split(' ')[0]} Q
                    </span>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                    <span className="text-[10px] text-emerald-200 block">Cost of Cultivation</span>
                    <span className="text-xs font-extrabold text-red-200 mt-0.5 block truncate">
                      ₹{activeCrop.costPerAcre.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-emerald-500/20 p-2 rounded-xl backdrop-blur-sm border border-emerald-400/30">
                    <span className="text-[10px] text-emerald-200 block font-semibold">Est. Net Profit</span>
                    <span className="text-xs font-black text-amber-300 mt-0.5 block truncate">
                      ₹{activeCrop.estProfitPerAcre.toLocaleString()} / Ac
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-100/90 pt-1">
                  <span className="flex items-center gap-1">
                    <Building2 size={12} className="text-emerald-400" />
                    Mandi: {activeCrop.mandiName.split('(')[0]}
                  </span>
                  <span className="font-bold text-amber-300">
                    Range: {activeCrop.priceRange}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS: Direct BUY & SELL Options */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block mb-2 text-center uppercase tracking-wider">
                  Select Action for {activeDetail.name} District:
                </span>

                <div className="grid grid-cols-2 gap-3">
                  {/* BUY PRODUCE (Opens Dealer Portal) */}
                  <button
                    onClick={() => {
                      onSelectDistrict(activeDetail.name);
                      if (onSelectPortalMode) {
                        onSelectPortalMode('dealer', activeDetail.name);
                      } else if (onViewListings) {
                        onViewListings(activeDetail.name);
                      }
                    }}
                    className={`py-3 px-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                      currentPortalMode === 'dealer'
                        ? "bg-[#184e38] text-white ring-2 ring-emerald-500 shadow-lg"
                        : "bg-gradient-to-r from-teal-800 to-emerald-800 hover:from-teal-900 hover:to-emerald-900 text-white"
                    }`}
                  >
                    <ShoppingCart size={16} className="text-emerald-300" />
                    <span>Buy Produce (Dealer Portal)</span>
                  </button>

                  {/* SELL PRODUCE (Opens Farmer Portal) */}
                  <button
                    onClick={() => {
                      onSelectDistrict(activeDetail.name);
                      if (onSelectPortalMode) {
                        onSelectPortalMode('farmer', activeDetail.name);
                      } else if (onViewListings) {
                        onViewListings(activeDetail.name);
                      }
                    }}
                    className={`py-3 px-3 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                      currentPortalMode === 'farmer'
                        ? "bg-emerald-700 text-white ring-2 ring-emerald-400 shadow-lg"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <Store size={16} className="text-emerald-200" />
                    <span>Sell Produce (Farmer Portal)</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
