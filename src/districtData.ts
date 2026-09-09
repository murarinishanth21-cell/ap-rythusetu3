export interface CropInfo {
  name: string;
  variety?: string;
  image: string;
  arrival: string;
  price: string;
  priceNum: number;
  priceRange: string;
  trend: string;
  trendPositive: boolean;
  msp?: string;
  mandiName: string;
  suitability: string;
  yieldPerAcre: string;
  yieldNum: number; // in quintals/acre
  costPerAcre: number; // in ₹
  estRevenuePerAcre: number; // in ₹
  estProfitPerAcre: number; // in ₹
  roi: string;
}

export interface DistrictDetail {
  name: string;
  center: [number, number]; // [lng, lat]
  tagline: string;
  soilType: string;
  primarySeason: string;
  rainfall: string;
  totalArrivals: string;
  activeFarmers: number;
  crops: CropInfo[];
}

export const CROP_IMAGES: Record<string, string> = {
  "palm oil": "/images/crops/palm_oil.jpg",
  "oil palm": "/images/crops/palm_oil.jpg",
  "cashew": "/images/crops/cashew_nuts.jpg",
  "cashew nut": "/images/crops/cashew_nuts.jpg",
  "cashew nuts": "/images/crops/cashew_nuts.jpg",
  "jeedipappu": "/images/crops/cashew_nuts.jpg",
  "black gram": "/images/crops/black_gram.jpg",
  "urad": "/images/crops/black_gram.jpg",
  "minumulu": "/images/crops/black_gram.jpg",
  "jaggery": "/images/crops/jaggery.jpg",
  "jaggarey": "/images/crops/jaggery.jpg",
  "bellam": "/images/crops/jaggery.jpg",
  "coconut": "/images/crops/coconut.jpg",
  "kobbari": "/images/crops/coconut.jpg",
  "cotton": "/images/crops/cotton.jpg",
  "pratti": "/images/crops/cotton.jpg",
  "turmeric": "/images/crops/turmeric.jpg",
  "pasupu": "/images/crops/turmeric.jpg",
  "groundnut": "/images/crops/groundnut.jpg",
  "peanut": "/images/crops/groundnut.jpg",
  "verusenaga": "/images/crops/groundnut.jpg",
  "sugarcane": "/images/crops/sugarcane.jpg",
  "sugar cane": "/images/crops/sugarcane.jpg",
  "cheruku": "/images/crops/sugarcane.jpg",
  "chilli": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=600&auto=format&fit=crop",
  "paddy": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
  "rice": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
  "mango": "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
  "orange": "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?q=80&w=600&auto=format&fit=crop",
  "mosambi": "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?q=80&w=600&auto=format&fit=crop",
  "banana": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600&auto=format&fit=crop",
  "maize": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=600&auto=format&fit=crop",
  "corn": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=600&auto=format&fit=crop",
  "tobacco": "https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=600&auto=format&fit=crop",
  "bengal gram": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=600&auto=format&fit=crop",
  "chickpea": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=600&auto=format&fit=crop",
  "senagalu": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=600&auto=format&fit=crop",
  "lemon": "https://images.unsplash.com/photo-1590502593747-42a996133562?q=80&w=600&auto=format&fit=crop",
  "lime": "https://images.unsplash.com/photo-1590502593747-42a996133562?q=80&w=600&auto=format&fit=crop",
  "onion": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=600&auto=format&fit=crop",
  "silk": "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=600&auto=format&fit=crop",
  "tomato": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop",
  "ragi": "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop",
  "millet": "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop",
  "coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
  "pepper": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop"
};

export function getCropImage(cropName: string): string {
  if (!cropName) return "/images/crops/groundnut.jpg";
  const lower = cropName.toLowerCase();
  for (const [key, url] of Object.entries(CROP_IMAGES)) {
    if (lower.includes(key)) {
      return url;
    }
  }
  return "https://images.unsplash.com/photo-1595188812674-d4f3b610c436?q=80&w=600&auto=format&fit=crop";
}

export const DISTRICT_DATA: Record<string, DistrictDetail> = {
  "Guntur": {
    name: "Guntur",
    center: [80.45, 16.3],
    tagline: "World-Famous Red Chilli, Cotton & Tobacco Hub",
    soilType: "Deep Black Cotton & Alluvial Soil",
    primarySeason: "Kharif & Rabi (Optimal Moisture)",
    rainfall: "864 mm Avg",
    totalArrivals: "40 Tons",
    activeFarmers: 342,
    crops: [
      {
        name: "Red Chilli",
        variety: "Teja & Byadagi Export Grade",
        image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=600&auto=format&fit=crop",
        arrival: "26 Tons",
        price: "₹18,500 / Q",
        priceNum: 18500,
        priceRange: "₹17,800 - ₹19,200",
        trend: "+4.8%",
        trendPositive: true,
        msp: "₹16,500 / Q",
        mandiName: "Guntur Mirchi Yard (Asia's Largest)",
        suitability: "98% (High Optimal)",
        yieldPerAcre: "22 - 25 Quintals/Acre",
        yieldNum: 24,
        costPerAcre: 55000,
        estRevenuePerAcre: 444000,
        estProfitPerAcre: 389000,
        roi: "707%"
      },
      {
        name: "Cotton",
        variety: "Long Staple Bt Cotton",
        image: "/images/crops/cotton.jpg",
        arrival: "14 Tons",
        price: "₹7,650 / Q",
        priceNum: 7650,
        priceRange: "₹7,200 - ₹7,900",
        trend: "+2.1%",
        trendPositive: true,
        msp: "₹7,122 / Q",
        mandiName: "Guntur Cotton Market Yard",
        suitability: "94% (Very High)",
        yieldPerAcre: "12 - 15 Quintals/Acre",
        yieldNum: 14,
        costPerAcre: 32000,
        estRevenuePerAcre: 107100,
        estProfitPerAcre: 75100,
        roi: "235%"
      }
    ]
  },
  "Krishna": {
    name: "Krishna",
    center: [81.0, 16.35],
    tagline: "Paddy & Banganapalli Mango Granary",
    soilType: "Rich Coastal Alluvial & Clayey Soil",
    primarySeason: "Kharif (Sarva) & Rabi (Dalva)",
    rainfall: "960 mm Avg",
    totalArrivals: "51 Tons",
    activeFarmers: 410,
    crops: [
      {
        name: "Paddy (Rice)",
        variety: "BPT 5204 (Sona Masoori)",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
        arrival: "45 Tons",
        price: "₹2,420 / Q",
        priceNum: 2420,
        priceRange: "₹2,320 - ₹2,550",
        trend: "+1.9%",
        trendPositive: true,
        msp: "₹2,300 / Q",
        mandiName: "Gudivada & Vijayawada Rythu Bazar",
        suitability: "99% (Ideal Deltaic)",
        yieldPerAcre: "30 - 35 Quintals/Acre",
        yieldNum: 32,
        costPerAcre: 28000,
        estRevenuePerAcre: 77440,
        estProfitPerAcre: 49440,
        roi: "177%"
      },
      {
        name: "Mango",
        variety: "GI-Tagged Banganapalli",
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
        arrival: "6 Tons",
        price: "₹4,600 / Q",
        priceNum: 4600,
        priceRange: "₹4,200 - ₹5,000",
        trend: "+3.4%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Nuzvid Mango Terminal Yard",
        suitability: "96% (High Tropical)",
        yieldPerAcre: "40 - 50 Quintals/Acre",
        yieldNum: 45,
        costPerAcre: 40000,
        estRevenuePerAcre: 207000,
        estProfitPerAcre: 167000,
        roi: "418%"
      }
    ]
  },
  "Ananthapur": {
    name: "Ananthapur",
    center: [77.5, 14.7],
    tagline: "Premier Groundnut, Sweet Orange & Millet Hub",
    soilType: "Red Sandy Loam & Light Black Soil",
    primarySeason: "Kharif Rainfed & Rabi Micro-Irrigation",
    rainfall: "550 mm Semi-Arid",
    totalArrivals: "58 Tons",
    activeFarmers: 289,
    crops: [
      {
        name: "Groundnut",
        variety: "K6 & Kadiri Bold",
        image: "/images/crops/groundnut.jpg",
        arrival: "42 Tons",
        price: "₹6,950 / Q",
        priceNum: 6950,
        priceRange: "₹6,600 - ₹7,250",
        trend: "+3.2%",
        trendPositive: true,
        msp: "₹6,783 / Q",
        mandiName: "Ananthapur Agricultural Market Yard",
        suitability: "97% (Arid Zone Best)",
        yieldPerAcre: "12 - 16 Quintals/Acre",
        yieldNum: 14,
        costPerAcre: 24000,
        estRevenuePerAcre: 97300,
        estProfitPerAcre: 73300,
        roi: "305%"
      },
      {
        name: "Sweet Orange (Mosambi)",
        variety: "Sathgudi Citrus",
        image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?q=80&w=600&auto=format&fit=crop",
        arrival: "16 Tons",
        price: "₹5,200 / Q",
        priceNum: 5200,
        priceRange: "₹4,800 - ₹5,500",
        trend: "+1.5%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Tadipatri Horticulture Mandi",
        suitability: "93% (High Drought Tolerant)",
        yieldPerAcre: "50 - 65 Quintals/Acre",
        yieldNum: 55,
        costPerAcre: 48000,
        estRevenuePerAcre: 286000,
        estProfitPerAcre: 238000,
        roi: "496%"
      }
    ]
  },
  "West Godavari": {
    name: "West Godavari",
    center: [81.6, 16.7],
    tagline: "Rice Granary & Aqua Culture Belt",
    soilType: "Deep Alluvial Deltaic & Rich Clay",
    primarySeason: "Double Crop Intensive (Kharif & Rabi)",
    rainfall: "1050 mm Avg",
    totalArrivals: "70 Tons",
    activeFarmers: 512,
    crops: [
      {
        name: "Paddy",
        variety: "MTU 1010 & Swarna Sub-1",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
        arrival: "52 Tons",
        price: "₹2,380 / Q",
        priceNum: 2380,
        priceRange: "₹2,300 - ₹2,450",
        trend: "+1.2%",
        trendPositive: true,
        msp: "₹2,300 / Q",
        mandiName: "Tadepalligudem & Bhimavaram Market",
        suitability: "99% (Delta Gold Standard)",
        yieldPerAcre: "34 - 38 Quintals/Acre",
        yieldNum: 36,
        costPerAcre: 27000,
        estRevenuePerAcre: 85680,
        estProfitPerAcre: 58680,
        roi: "217%"
      },
      {
        name: "Coconut",
        variety: "East Coast Tall & Hybrid Green",
        image: "/images/crops/coconut.jpg",
        arrival: "18 Tons",
        price: "₹2,950 / Q",
        priceNum: 2950,
        priceRange: "₹2,700 - ₹3,200",
        trend: "+4.1%",
        trendPositive: true,
        msp: "₹3,000 / Q",
        mandiName: "Tanuku Coconut Terminal Yard",
        suitability: "97% (High Coastal)",
        yieldPerAcre: "45 - 60 Quintals/Acre",
        yieldNum: 50,
        costPerAcre: 35000,
        estRevenuePerAcre: 147500,
        estProfitPerAcre: 112500,
        roi: "321%"
      }
    ]
  },
  "East Godavari": {
    name: "East Godavari",
    center: [81.8, 17.0],
    tagline: "Fertile Delta Paddy & Horticulture Hub",
    soilType: "Alluvial Silty Loam",
    primarySeason: "Kharif & Rabi Year-Round",
    rainfall: "1100 mm Avg",
    totalArrivals: "53 Tons",
    activeFarmers: 380,
    crops: [
      {
        name: "Paddy",
        variety: "MTU 1061 (Indra)",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
        arrival: "38 Tons",
        price: "₹2,360 / Q",
        priceNum: 2360,
        priceRange: "₹2,280 - ₹2,420",
        trend: "+1.6%",
        trendPositive: true,
        msp: "₹2,300 / Q",
        mandiName: "Rajahmundry Agri Market Yard",
        suitability: "98% (High Optimal)",
        yieldPerAcre: "32 - 36 Quintals/Acre",
        yieldNum: 34,
        costPerAcre: 26500,
        estRevenuePerAcre: 80240,
        estProfitPerAcre: 53740,
        roi: "203%"
      },
      {
        name: "Banana",
        variety: "Grand Naine & Karpura Chekkarakeli",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600&auto=format&fit=crop",
        arrival: "15 Tons",
        price: "₹1,950 / Q",
        priceNum: 1950,
        priceRange: "₹1,800 - ₹2,150",
        trend: "+2.8%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Ravulapalem Banana Market Yard",
        suitability: "96% (High Tropical)",
        yieldPerAcre: "120 - 150 Quintals/Acre",
        yieldNum: 135,
        costPerAcre: 65000,
        estRevenuePerAcre: 263250,
        estProfitPerAcre: 198250,
        roi: "305%"
      }
    ]
  },
  "Konaseema": {
    name: "Konaseema",
    center: [81.95, 16.6],
    tagline: "Coconut Capital & Wet Delta Crops",
    soilType: "Rich Coastal Alluvial & Estuarine Loam",
    primarySeason: "Perennial Horticulture & Paddy",
    rainfall: "1150 mm Avg",
    totalArrivals: "52 Tons",
    activeFarmers: 290,
    crops: [
      {
        name: "Coconut",
        variety: "Godavari Ganga & Deejay Hybrid",
        image: "/images/crops/coconut.jpg",
        arrival: "30 Tons",
        price: "₹3,150 / Q",
        priceNum: 3150,
        priceRange: "₹2,950 - ₹3,350",
        trend: "+4.5%",
        trendPositive: true,
        msp: "₹3,000 / Q",
        mandiName: "Amalapuram Coconut Mandi",
        suitability: "99% (Ideal Delta Island)",
        yieldPerAcre: "55 - 70 Quintals/Acre",
        yieldNum: 60,
        costPerAcre: 36000,
        estRevenuePerAcre: 189000,
        estProfitPerAcre: 153000,
        roi: "425%"
      },
      {
        name: "Paddy",
        variety: "BPT 2270 (Bhavani)",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
        arrival: "22 Tons",
        price: "₹2,370 / Q",
        priceNum: 2370,
        priceRange: "₹2,300 - ₹2,440",
        trend: "+1.1%",
        trendPositive: true,
        msp: "₹2,300 / Q",
        mandiName: "Razole & Kothapeta Market Yard",
        suitability: "97% (High Optimal)",
        yieldPerAcre: "32 - 36 Quintals/Acre",
        yieldNum: 34,
        costPerAcre: 27000,
        estRevenuePerAcre: 80580,
        estProfitPerAcre: 53580,
        roi: "198%"
      }
    ]
  },
  "Kakinada": {
    name: "Kakinada",
    center: [82.2, 17.0],
    tagline: "Paddy, Maize & Coastal Agri-Export Gateway",
    soilType: "Coastal Alluvial & Heavy Black Soil",
    primarySeason: "Kharif & Rabi",
    rainfall: "1020 mm Avg",
    totalArrivals: "46 Tons",
    activeFarmers: 275,
    crops: [
      {
        name: "Paddy",
        variety: "Export Grade Non-Basmati White Rice",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
        arrival: "30 Tons",
        price: "₹2,390 / Q",
        priceNum: 2390,
        priceRange: "₹2,320 - ₹2,460",
        trend: "+2.2%",
        trendPositive: true,
        msp: "₹2,300 / Q",
        mandiName: "Kakinada Port Agriculture Terminal",
        suitability: "98% (High Export Quality)",
        yieldPerAcre: "33 - 37 Quintals/Acre",
        yieldNum: 35,
        costPerAcre: 27500,
        estRevenuePerAcre: 83650,
        estProfitPerAcre: 56150,
        roi: "204%"
      },
      {
        name: "Maize",
        variety: "Hybrid Yellow Corn",
        image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=600&auto=format&fit=crop",
        arrival: "16 Tons",
        price: "₹2,180 / Q",
        priceNum: 2180,
        priceRange: "₹2,050 - ₹2,280",
        trend: "+3.1%",
        trendPositive: true,
        msp: "₹2,090 / Q",
        mandiName: "Peddapuram Agri Yard",
        suitability: "94% (Very High)",
        yieldPerAcre: "35 - 42 Quintals/Acre",
        yieldNum: 38,
        costPerAcre: 25000,
        estRevenuePerAcre: 82840,
        estProfitPerAcre: 57840,
        roi: "231%"
      }
    ]
  },
  "Eluru": {
    name: "Eluru",
    center: [81.1, 16.7],
    tagline: "Oil Palm, Paddy & Horticulture Granary",
    soilType: "Fertile Alluvial & Red Clay Loam",
    primarySeason: "Kharif, Rabi & Perennial Plantation",
    rainfall: "980 mm Avg",
    totalArrivals: "48 Tons",
    activeFarmers: 310,
    crops: [
      {
        name: "Oil Palm",
        variety: "Fresh Fruit Bunches (Tenera)",
        image: "/images/crops/palm_oil.jpg",
        arrival: "32 Tons",
        price: "₹14,200 / Ton",
        priceNum: 14200,
        priceRange: "₹13,500 - ₹14,800",
        trend: "+5.2%",
        trendPositive: true,
        msp: "Formula Linked",
        mandiName: "Pedavegi & Denduluru Oil Palm Factory",
        suitability: "98% (State Leader)",
        yieldPerAcre: "8 - 10 Tons/Acre",
        yieldNum: 9,
        costPerAcre: 38000,
        estRevenuePerAcre: 127800,
        estProfitPerAcre: 89800,
        roi: "236%"
      },
      {
        name: "Paddy",
        variety: "MTU 1224 (Maruteru Samba)",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
        arrival: "16 Tons",
        price: "₹2,350 / Q",
        priceNum: 2350,
        priceRange: "₹2,280 - ₹2,420",
        trend: "+1.3%",
        trendPositive: true,
        msp: "₹2,300 / Q",
        mandiName: "Eluru Agri Market Yard",
        suitability: "96% (High Optimal)",
        yieldPerAcre: "32 - 36 Quintals/Acre",
        yieldNum: 34,
        costPerAcre: 26500,
        estRevenuePerAcre: 79900,
        estProfitPerAcre: 53400,
        roi: "201%"
      }
    ]
  },
  "NTR": {
    name: "NTR",
    center: [80.6, 16.5],
    tagline: "Commercial Trade, Mango & Pulse Epicenter",
    soilType: "Rich Krishna River Alluvial Loam",
    primarySeason: "Kharif & Rabi",
    rainfall: "920 mm Avg",
    totalArrivals: "44 Tons",
    activeFarmers: 320,
    crops: [
      {
        name: "Mango",
        variety: "Banganapalli & Chinna Rasalu",
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
        arrival: "22 Tons",
        price: "₹4,700 / Q",
        priceNum: 4700,
        priceRange: "₹4,300 - ₹5,100",
        trend: "+3.9%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Nunna Mango Market (Asia Top 3)",
        suitability: "98% (High Flavor Index)",
        yieldPerAcre: "42 - 52 Quintals/Acre",
        yieldNum: 46,
        costPerAcre: 41000,
        estRevenuePerAcre: 216200,
        estProfitPerAcre: 175200,
        roi: "427%"
      },
      {
        name: "Black Gram (Urad Dal)",
        variety: "LBG-752 & PU-31",
        image: "/images/crops/black_gram.jpg",
        arrival: "22 Tons",
        price: "₹8,400 / Q",
        priceNum: 8400,
        priceRange: "₹8,000 - ₹8,850",
        trend: "+4.2%",
        trendPositive: true,
        msp: "₹7,400 / Q",
        mandiName: "Vijayawada Wholesale Grain Mandi",
        suitability: "95% (High Pulse Yield)",
        yieldPerAcre: "8 - 11 Quintals/Acre",
        yieldNum: 9.5,
        costPerAcre: 18000,
        estRevenuePerAcre: 79800,
        estProfitPerAcre: 61800,
        roi: "343%"
      }
    ]
  },
  "Palnadu": {
    name: "Palnadu",
    center: [79.9, 16.2],
    tagline: "Red Chilli, Cotton & Pulse Heartland",
    soilType: "Deep Black Cotton & Limestone Mixed Soils",
    primarySeason: "Kharif & Semi-Arid Rabi",
    rainfall: "760 mm Avg",
    totalArrivals: "42 Tons",
    activeFarmers: 295,
    crops: [
      {
        name: "Red Chilli",
        variety: "334 & Teja Spiced Variety",
        image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=600&auto=format&fit=crop",
        arrival: "25 Tons",
        price: "₹18,200 / Q",
        priceNum: 18200,
        priceRange: "₹17,500 - ₹18,900",
        trend: "+4.1%",
        trendPositive: true,
        msp: "₹16,500 / Q",
        mandiName: "Narasaraopet & Macherla Market Yard",
        suitability: "97% (High Optimal)",
        yieldPerAcre: "20 - 24 Quintals/Acre",
        yieldNum: 22,
        costPerAcre: 52000,
        estRevenuePerAcre: 400400,
        estProfitPerAcre: 348400,
        roi: "670%"
      },
      {
        name: "Cotton",
        variety: "Medium-Long Staple",
        image: "/images/crops/cotton.jpg",
        arrival: "17 Tons",
        price: "₹7,550 / Q",
        priceNum: 7550,
        priceRange: "₹7,100 - ₹7,850",
        trend: "+1.8%",
        trendPositive: true,
        msp: "₹7,122 / Q",
        mandiName: "Piduguralla Cotton Market",
        suitability: "94% (High Black Soil)",
        yieldPerAcre: "12 - 15 Quintals/Acre",
        yieldNum: 13.5,
        costPerAcre: 31000,
        estRevenuePerAcre: 101925,
        estProfitPerAcre: 70925,
        roi: "228%"
      }
    ]
  },
  "Bapatla": {
    name: "Bapatla",
    center: [80.46, 15.9],
    tagline: "Coastal Paddy, Cashew & Groundnut Belt",
    soilType: "Coastal Sandy Alluvial & Wet Plains",
    primarySeason: "Kharif & Rabi Coastal",
    rainfall: "940 mm Avg",
    totalArrivals: "38 Tons",
    activeFarmers: 260,
    crops: [
      {
        name: "Paddy",
        variety: "BPT 5204 & MTU 1001",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
        arrival: "24 Tons",
        price: "₹2,390 / Q",
        priceNum: 2390,
        priceRange: "₹2,320 - ₹2,460",
        trend: "+1.7%",
        trendPositive: true,
        msp: "₹2,300 / Q",
        mandiName: "Bapatla & Chirala Market Yard",
        suitability: "98% (High Alluvial)",
        yieldPerAcre: "32 - 36 Quintals/Acre",
        yieldNum: 34,
        costPerAcre: 27000,
        estRevenuePerAcre: 81260,
        estProfitPerAcre: 54260,
        roi: "200%"
      },
      {
        name: "Cashew Nut",
        variety: "BPP-8 High Yielding Hybrid",
        image: "/images/crops/cashew_nuts.jpg",
        arrival: "14 Tons",
        price: "₹12,400 / Q",
        priceNum: 12400,
        priceRange: "₹11,800 - ₹13,100",
        trend: "+5.1%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Vetapalem Cashew Market Yard",
        suitability: "96% (Coastal Best)",
        yieldPerAcre: "8 - 12 Quintals/Acre",
        yieldNum: 10,
        costPerAcre: 30000,
        estRevenuePerAcre: 124000,
        estProfitPerAcre: 94000,
        roi: "313%"
      }
    ]
  },
  "Prakasam": {
    name: "Prakasam",
    center: [79.8, 15.4],
    tagline: "Virginia Flue-Cured Tobacco & Bengal Gram Hub",
    soilType: "Red Loamy & Medium Black Cotton Soil",
    primarySeason: "Kharif (Rainfed) & Rabi (Extensive)",
    rainfall: "750 mm Avg",
    totalArrivals: "49 Tons",
    activeFarmers: 340,
    crops: [
      {
        name: "Tobacco (FCV)",
        variety: "Flue Cured Virginia (Export Grade)",
        image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=600&auto=format&fit=crop",
        arrival: "31 Tons",
        price: "₹24,500 / Q",
        priceNum: 24500,
        priceRange: "₹23,000 - ₹26,000",
        trend: "+6.2%",
        trendPositive: true,
        msp: "Tobacco Board Auction Minimum",
        mandiName: "Ongole Tobacco Board Auction Platform",
        suitability: "99% (Global Quality)",
        yieldPerAcre: "8 - 11 Quintals/Acre",
        yieldNum: 9.5,
        costPerAcre: 60000,
        estRevenuePerAcre: 232750,
        estProfitPerAcre: 172750,
        roi: "288%"
      },
      {
        name: "Bengal Gram (Chickpea)",
        variety: "JG-11 & KAK-2 Bold",
        image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=600&auto=format&fit=crop",
        arrival: "18 Tons",
        price: "₹6,150 / Q",
        priceNum: 6150,
        priceRange: "₹5,800 - ₹6,450",
        trend: "+2.9%",
        trendPositive: true,
        msp: "₹5,440 / Q",
        mandiName: "Markapur & Santhanuthalapadu Mandi",
        suitability: "96% (Rabi Black Soil)",
        yieldPerAcre: "10 - 13 Quintals/Acre",
        yieldNum: 11.5,
        costPerAcre: 19000,
        estRevenuePerAcre: 70725,
        estProfitPerAcre: 51725,
        roi: "272%"
      }
    ]
  },
  "Nellore": {
    name: "Nellore",
    center: [79.9, 14.4],
    tagline: "Nellore Molagolukulu Fine Rice & Lemon Hub",
    soilType: "Coastal Red Loam & Penna River Alluvium",
    primarySeason: "Late Kharif (Samba) & Rabi",
    rainfall: "1080 mm Coastal Cyclonic",
    totalArrivals: "54 Tons",
    activeFarmers: 360,
    crops: [
      {
        name: "Nellore Rice",
        variety: "Molagolukulu (NLR 34449)",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
        arrival: "38 Tons",
        price: "₹2,750 / Q",
        priceNum: 2750,
        priceRange: "₹2,600 - ₹2,900",
        trend: "+3.8%",
        trendPositive: true,
        msp: "₹2,300 / Q",
        mandiName: "Nellore Stonebridge Agri Mandi",
        suitability: "99% (GI Renowned Fine Grain)",
        yieldPerAcre: "30 - 34 Quintals/Acre",
        yieldNum: 32,
        costPerAcre: 28000,
        estRevenuePerAcre: 88000,
        estProfitPerAcre: 60000,
        roi: "214%"
      },
      {
        name: "Lemon (Acid Lime)",
        variety: "Balaji & Vikram Citron",
        image: "https://images.unsplash.com/photo-1590502593747-42a996133562?q=80&w=600&auto=format&fit=crop",
        arrival: "16 Tons",
        price: "₹6,800 / Q",
        priceNum: 6800,
        priceRange: "₹6,200 - ₹7,400",
        trend: "+5.4%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Gudur Lemon Wholesale Market Yard",
        suitability: "97% (Highest Lemon Yield)",
        yieldPerAcre: "60 - 80 Quintals/Acre",
        yieldNum: 70,
        costPerAcre: 55000,
        estRevenuePerAcre: 476000,
        estProfitPerAcre: 421000,
        roi: "765%"
      }
    ]
  },
  "Kurnool": {
    name: "Kurnool",
    center: [78.0, 15.8],
    tagline: "Adoni Cotton Capital, Onion & Groundnut Hub",
    soilType: "Heavy Deep Black Cotton Soils & Mixed Red",
    primarySeason: "Kharif & Rabi (Tungabhadra Canal)",
    rainfall: "670 mm Avg",
    totalArrivals: "62 Tons",
    activeFarmers: 430,
    crops: [
      {
        name: "Cotton",
        variety: "Adoni Long Staple Bt Hybrid",
        image: "/images/crops/cotton.jpg",
        arrival: "38 Tons",
        price: "₹7,750 / Q",
        priceNum: 7750,
        priceRange: "₹7,300 - ₹8,100",
        trend: "+3.6%",
        trendPositive: true,
        msp: "₹7,122 / Q",
        mandiName: "Adoni Cotton Market (AP's Largest Cotton Yard)",
        suitability: "98% (High Optimal)",
        yieldPerAcre: "14 - 17 Quintals/Acre",
        yieldNum: 15.5,
        costPerAcre: 33000,
        estRevenuePerAcre: 120125,
        estProfitPerAcre: 87125,
        roi: "264%"
      },
      {
        name: "Onion",
        variety: "Kurnool Red Bellary Variety",
        image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=600&auto=format&fit=crop",
        arrival: "24 Tons",
        price: "₹2,650 / Q",
        priceNum: 2650,
        priceRange: "₹2,300 - ₹3,000",
        trend: "+7.8%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Kurnool Rythu Bazaar & Market Yard",
        suitability: "95% (High Cash Crop)",
        yieldPerAcre: "90 - 110 Quintals/Acre",
        yieldNum: 100,
        costPerAcre: 45000,
        estRevenuePerAcre: 265000,
        estProfitPerAcre: 220000,
        roi: "488%"
      }
    ]
  },
  "Nandyal": {
    name: "Nandyal",
    center: [78.48, 15.48],
    tagline: "Bengal Gram, Maize & Sunflower Basin",
    soilType: "Deep Calcareous Black Cotton Soils",
    primarySeason: "Rabi Bengal Gram & Kharif Maize",
    rainfall: "730 mm Avg",
    totalArrivals: "47 Tons",
    activeFarmers: 310,
    crops: [
      {
        name: "Bengal Gram",
        variety: "Nandyal Senagalu (NBeG 3)",
        image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=600&auto=format&fit=crop",
        arrival: "29 Tons",
        price: "₹6,280 / Q",
        priceNum: 6280,
        priceRange: "₹5,900 - ₹6,550",
        trend: "+3.5%",
        trendPositive: true,
        msp: "₹5,440 / Q",
        mandiName: "Nandyal Agricultural Market Yard",
        suitability: "99% (State Record Yields)",
        yieldPerAcre: "12 - 15 Quintals/Acre",
        yieldNum: 13.5,
        costPerAcre: 20000,
        estRevenuePerAcre: 84780,
        estProfitPerAcre: 64780,
        roi: "323%"
      },
      {
        name: "Maize",
        variety: "High Starch Yellow Feed Corn",
        image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=600&auto=format&fit=crop",
        arrival: "18 Tons",
        price: "₹2,220 / Q",
        priceNum: 2220,
        priceRange: "₹2,100 - ₹2,340",
        trend: "+2.4%",
        trendPositive: true,
        msp: "₹2,090 / Q",
        mandiName: "Allagadda & Nandyal Grain Mandi",
        suitability: "96% (High Optimal)",
        yieldPerAcre: "38 - 44 Quintals/Acre",
        yieldNum: 40,
        costPerAcre: 26000,
        estRevenuePerAcre: 88800,
        estProfitPerAcre: 62800,
        roi: "241%"
      }
    ]
  },
  "Sri Sathya Sai": {
    name: "Sri Sathya Sai",
    center: [77.8, 14.1],
    tagline: "Groundnut, Mulberry Sericulture & Millet Belt",
    soilType: "Red Sandy Loam & Gravely Soils",
    primarySeason: "Kharif Rainfed & Drip Horticulture",
    rainfall: "580 mm Semi-Arid",
    totalArrivals: "41 Tons",
    activeFarmers: 270,
    crops: [
      {
        name: "Groundnut",
        variety: "TMV-2 & Kadiri-6",
        image: "/images/crops/groundnut.jpg",
        arrival: "27 Tons",
        price: "₹6,900 / Q",
        priceNum: 6900,
        priceRange: "₹6,500 - ₹7,200",
        trend: "+2.8%",
        trendPositive: true,
        msp: "₹6,783 / Q",
        mandiName: "Dharmavaram Agri Market Yard",
        suitability: "96% (High Oil Content)",
        yieldPerAcre: "11 - 14 Quintals/Acre",
        yieldNum: 13,
        costPerAcre: 23500,
        estRevenuePerAcre: 89700,
        estProfitPerAcre: 66200,
        roi: "281%"
      },
      {
        name: "Mulberry Silk (Cocoon)",
        variety: "Bivoltine High Grade Silk Cocoon",
        image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=600&auto=format&fit=crop",
        arrival: "14 Tons",
        price: "₹48,000 / Q",
        priceNum: 48000,
        priceRange: "₹44,000 - ₹52,000",
        trend: "+6.5%",
        trendPositive: true,
        msp: "Govt Cocoon Market Base",
        mandiName: "Hindupur Govt Silk Cocoon Market",
        suitability: "98% (Highest Silk Output)",
        yieldPerAcre: "4 - 6 Quintals Cocoon/Acre",
        yieldNum: 5,
        costPerAcre: 65000,
        estRevenuePerAcre: 240000,
        estProfitPerAcre: 175000,
        roi: "269%"
      }
    ]
  },
  "YSR Kadapa": {
    name: "YSR Kadapa",
    center: [78.8, 14.5],
    tagline: "Turmeric, Banana & Sweet Lime Granary",
    soilType: "Red Sandy Loams & Black Clayey Soils",
    primarySeason: "Kharif & Rabi (Penna Basin)",
    rainfall: "700 mm Avg",
    totalArrivals: "45 Tons",
    activeFarmers: 310,
    crops: [
      {
        name: "Turmeric",
        variety: "Kadapa Yellow Curcumin Rich",
        image: "/images/crops/turmeric.jpg",
        arrival: "28 Tons",
        price: "₹14,800 / Q",
        priceNum: 14800,
        priceRange: "₹13,900 - ₹15,600",
        trend: "+5.8%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Duggirala & Kadapa Turmeric Market Yard",
        suitability: "98% (High Curcumin)",
        yieldPerAcre: "22 - 26 Quintals/Acre (Cured)",
        yieldNum: 24,
        costPerAcre: 65000,
        estRevenuePerAcre: 355200,
        estProfitPerAcre: 290200,
        roi: "446%"
      },
      {
        name: "Banana",
        variety: "Tissue Culture Grand Naine",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600&auto=format&fit=crop",
        arrival: "17 Tons",
        price: "₹2,100 / Q",
        priceNum: 2100,
        priceRange: "₹1,900 - ₹2,350",
        trend: "+3.2%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Pulivendula & Kadapa Fruit Market",
        suitability: "96% (High Sugar Brix)",
        yieldPerAcre: "140 - 170 Quintals/Acre",
        yieldNum: 155,
        costPerAcre: 70000,
        estRevenuePerAcre: 325500,
        estProfitPerAcre: 255500,
        roi: "365%"
      }
    ]
  },
  "Annamayya": {
    name: "Annamayya",
    center: [78.7, 13.9],
    tagline: "Tomato Capital & Mango Horticulture Hub",
    soilType: "Red Gravelly Soils & Loams",
    primarySeason: "Year-Round Horticulture",
    rainfall: "740 mm Avg",
    totalArrivals: "56 Tons",
    activeFarmers: 350,
    crops: [
      {
        name: "Tomato",
        variety: "Madanapalle Hybrid Red Tomato",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop",
        arrival: "38 Tons",
        price: "₹3,400 / Q",
        priceNum: 3400,
        priceRange: "₹2,800 - ₹4,000",
        trend: "+8.5%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Madanapalle Tomato Mandi (Asia's Largest Tomato Yard)",
        suitability: "99% (Ideal Microclimate)",
        yieldPerAcre: "160 - 200 Quintals/Acre",
        yieldNum: 180,
        costPerAcre: 85000,
        estRevenuePerAcre: 612000,
        estProfitPerAcre: 527000,
        roi: "620%"
      },
      {
        name: "Mango",
        variety: "Totapuri (Processing Grade) & Banganapalli",
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
        arrival: "18 Tons",
        price: "₹3,800 / Q",
        priceNum: 3800,
        priceRange: "₹3,400 - ₹4,200",
        trend: "+2.7%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Rayachoti & Madanapalle Pulp Terminal",
        suitability: "95% (High Pulp Yield)",
        yieldPerAcre: "50 - 65 Quintals/Acre",
        yieldNum: 58,
        costPerAcre: 44000,
        estRevenuePerAcre: 220400,
        estProfitPerAcre: 176400,
        roi: "400%"
      }
    ]
  },
  "Chittoor": {
    name: "Chittoor",
    center: [79.1, 13.2],
    tagline: "Dairy, Totapuri Mango Pulp & Sugarcane Basin",
    soilType: "Red Sandy Loam & Weathered Granitic Soil",
    primarySeason: "Kharif & Rabi Horticulture",
    rainfall: "910 mm Avg",
    totalArrivals: "50 Tons",
    activeFarmers: 370,
    crops: [
      {
        name: "Mango (Totapuri)",
        variety: "Industrial Pulp Processing Grade",
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
        arrival: "32 Tons",
        price: "₹3,950 / Q",
        priceNum: 3950,
        priceRange: "₹3,600 - ₹4,400",
        trend: "+3.6%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Chittoor Fruit Processing Market Yard",
        suitability: "99% (AP Mango Pulp Capital)",
        yieldPerAcre: "55 - 70 Quintals/Acre",
        yieldNum: 62,
        costPerAcre: 45000,
        estRevenuePerAcre: 244900,
        estProfitPerAcre: 199900,
        roi: "444%"
      },
      {
        name: "Sugarcane",
        variety: "Co 86032 High Recovery",
        image: "/images/crops/sugarcane.jpg",
        arrival: "18 Tons",
        price: "₹3,400 / Ton",
        priceNum: 3400,
        priceRange: "₹3,200 - ₹3,600",
        trend: "+1.9%",
        trendPositive: true,
        msp: "₹3,400 / Ton (FRP)",
        mandiName: "Chittoor Sugar Mill Gate Yard",
        suitability: "94% (High Sucrose)",
        yieldPerAcre: "40 - 50 Tons/Acre",
        yieldNum: 45,
        costPerAcre: 48000,
        estRevenuePerAcre: 153000,
        estProfitPerAcre: 105000,
        roi: "218%"
      }
    ]
  },
  "Tirupati": {
    name: "Tirupati",
    center: [79.4, 13.6],
    tagline: "Paddy, Groundnut & Organic Horticulture Haven",
    soilType: "Red Loamy & Coastal Mixed Soils",
    primarySeason: "Kharif & Rabi",
    rainfall: "1050 mm Avg",
    totalArrivals: "36 Tons",
    activeFarmers: 240,
    crops: [
      {
        name: "Paddy",
        variety: "NLR 34449 & IR 64",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
        arrival: "22 Tons",
        price: "₹2,410 / Q",
        priceNum: 2410,
        priceRange: "₹2,320 - ₹2,480",
        trend: "+1.8%",
        trendPositive: true,
        msp: "₹2,300 / Q",
        mandiName: "Tirupati & Srikalahasti Agri Yard",
        suitability: "97% (High Optimal)",
        yieldPerAcre: "30 - 34 Quintals/Acre",
        yieldNum: 32,
        costPerAcre: 27000,
        estRevenuePerAcre: 77120,
        estProfitPerAcre: 50120,
        roi: "185%"
      },
      {
        name: "Groundnut",
        variety: "Dharani & Kadiri Bold",
        image: "/images/crops/groundnut.jpg",
        arrival: "14 Tons",
        price: "₹6,880 / Q",
        priceNum: 6880,
        priceRange: "₹6,500 - ₹7,150",
        trend: "+2.5%",
        trendPositive: true,
        msp: "₹6,783 / Q",
        mandiName: "Chandragiri Groundnut Yard",
        suitability: "95% (High Pod Yield)",
        yieldPerAcre: "12 - 15 Quintals/Acre",
        yieldNum: 13.5,
        costPerAcre: 24000,
        estRevenuePerAcre: 92880,
        estProfitPerAcre: 68880,
        roi: "287%"
      }
    ]
  },
  "Visakhapatnam": {
    name: "Visakhapatnam",
    center: [83.3, 17.7],
    tagline: "Sugarcane, Horticulture & Marine-Agri Corridor",
    soilType: "Red Sandy Loam & Coastal Saline Soil",
    primarySeason: "Kharif & Rabi Coastal",
    rainfall: "1120 mm Coastal",
    totalArrivals: "39 Tons",
    activeFarmers: 280,
    crops: [
      {
        name: "Sugarcane",
        variety: "Co 7706 & Co 86032",
        image: "/images/crops/sugarcane.jpg",
        arrival: "24 Tons",
        price: "₹3,450 / Ton",
        priceNum: 3450,
        priceRange: "₹3,250 - ₹3,650",
        trend: "+2.2%",
        trendPositive: true,
        msp: "₹3,400 / Ton (FRP)",
        mandiName: "Anandapuram Agri Terminal Yard",
        suitability: "96% (High Sucrose Yield)",
        yieldPerAcre: "42 - 50 Tons/Acre",
        yieldNum: 46,
        costPerAcre: 47000,
        estRevenuePerAcre: 158700,
        estProfitPerAcre: 111700,
        roi: "237%"
      },
      {
        name: "Cashew Nut",
        variety: "Vengurla-4 Hybrid",
        image: "/images/crops/cashew_nuts.jpg",
        arrival: "15 Tons",
        price: "₹12,200 / Q",
        priceNum: 12200,
        priceRange: "₹11,600 - ₹12,800",
        trend: "+4.4%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Bheemunipatnam Cashew Market",
        suitability: "95% (High Nut Quality)",
        yieldPerAcre: "8 - 11 Quintals/Acre",
        yieldNum: 9.5,
        costPerAcre: 29000,
        estRevenuePerAcre: 115900,
        estProfitPerAcre: 86900,
        roi: "299%"
      }
    ]
  },
  "Anakapalli": {
    name: "Anakapalli",
    center: [83.0, 17.69],
    tagline: "India's 2nd Largest Jaggery Market & Sugarcane Hub",
    soilType: "Fertile Alluvial & Coastal Red Loam",
    primarySeason: "Year-Round Sugarcane & Kharif Paddy",
    rainfall: "1080 mm Avg",
    totalArrivals: "55 Tons",
    activeFarmers: 390,
    crops: [
      {
        name: "Jaggery (Bellam)",
        variety: "GI-Registered Anakapalli Golden Jaggery Lump",
        image: "/images/crops/jaggery.jpg",
        arrival: "38 Tons",
        price: "₹4,850 / Q",
        priceNum: 4850,
        priceRange: "₹4,500 - ₹5,200",
        trend: "+5.6%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Anakapalli Jaggery Market (Asia's 2nd Largest)",
        suitability: "99% (Gold Standard Jaggery)",
        yieldPerAcre: "45 - 55 Quintals Jaggery/Acre",
        yieldNum: 50,
        costPerAcre: 60000,
        estRevenuePerAcre: 242500,
        estProfitPerAcre: 182500,
        roi: "304%"
      },
      {
        name: "Paddy",
        variety: "RGL 2537 (Srikakulam Sannalu)",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
        arrival: "17 Tons",
        price: "₹2,380 / Q",
        priceNum: 2380,
        priceRange: "₹2,300 - ₹2,450",
        trend: "+1.5%",
        trendPositive: true,
        msp: "₹2,300 / Q",
        mandiName: "Chodavaram Agri Market Yard",
        suitability: "96% (High Optimal)",
        yieldPerAcre: "30 - 35 Quintals/Acre",
        yieldNum: 33,
        costPerAcre: 26000,
        estRevenuePerAcre: 78540,
        estProfitPerAcre: 52540,
        roi: "202%"
      }
    ]
  },
  "Vizianagaram": {
    name: "Vizianagaram",
    center: [83.4, 18.1],
    tagline: "Maize, Jute, Mango & Millets Heartland",
    soilType: "Red Sandy Loams & Lateritic Soils",
    primarySeason: "Kharif & Rabi (Nagavali / Champavathi)",
    rainfall: "1130 mm Avg",
    totalArrivals: "44 Tons",
    activeFarmers: 295,
    crops: [
      {
        name: "Maize",
        variety: "Pioneer Hybrid Grain Corn",
        image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=600&auto=format&fit=crop",
        arrival: "26 Tons",
        price: "₹2,240 / Q",
        priceNum: 2240,
        priceRange: "₹2,120 - ₹2,360",
        trend: "+3.3%",
        trendPositive: true,
        msp: "₹2,090 / Q",
        mandiName: "Vizianagaram Agri Market Yard",
        suitability: "97% (High Grain Starch)",
        yieldPerAcre: "36 - 42 Quintals/Acre",
        yieldNum: 39,
        costPerAcre: 25000,
        estRevenuePerAcre: 87360,
        estProfitPerAcre: 62360,
        roi: "249%"
      },
      {
        name: "Mango",
        variety: "Suvarnarekha & Banganapalli",
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
        arrival: "18 Tons",
        price: "₹4,300 / Q",
        priceNum: 4300,
        priceRange: "₹3,900 - ₹4,700",
        trend: "+2.9%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Salur & Bobbili Fruit Mandi",
        suitability: "95% (High Climate Match)",
        yieldPerAcre: "45 - 55 Quintals/Acre",
        yieldNum: 50,
        costPerAcre: 42000,
        estRevenuePerAcre: 215000,
        estProfitPerAcre: 173000,
        roi: "411%"
      }
    ]
  },
  "Srikakulam": {
    name: "Srikakulam",
    center: [83.9, 18.3],
    tagline: "Cashew, Paddy & Coconut Coastal Frontier",
    soilType: "Coastal Alluvial, Red Loam & Laterite",
    primarySeason: "Kharif (Vamsadhara Basin)",
    rainfall: "1180 mm High Rainfall",
    totalArrivals: "43 Tons",
    activeFarmers: 310,
    crops: [
      {
        name: "Cashew Nut",
        variety: "Palasa Raw Cashew Nut (GI Grade)",
        image: "/images/crops/cashew_nuts.jpg",
        arrival: "28 Tons",
        price: "₹12,800 / Q",
        priceNum: 12800,
        priceRange: "₹12,200 - ₹13,500",
        trend: "+5.7%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Palasa Cashew Market (AP Cashew Capital)",
        suitability: "99% (GI Renowned Hub)",
        yieldPerAcre: "9 - 13 Quintals/Acre",
        yieldNum: 11,
        costPerAcre: 31000,
        estRevenuePerAcre: 140800,
        estProfitPerAcre: 109800,
        roi: "354%"
      },
      {
        name: "Paddy",
        variety: "BPT 5204 & MTU 1061",
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop",
        arrival: "15 Tons",
        price: "₹2,360 / Q",
        priceNum: 2360,
        priceRange: "₹2,280 - ₹2,420",
        trend: "+1.4%",
        trendPositive: true,
        msp: "₹2,300 / Q",
        mandiName: "Amadalavalasa Agri Market Yard",
        suitability: "97% (High Optimal)",
        yieldPerAcre: "30 - 35 Quintals/Acre",
        yieldNum: 33,
        costPerAcre: 26000,
        estRevenuePerAcre: 77880,
        estProfitPerAcre: 51880,
        roi: "199%"
      }
    ]
  },
  "Parvathipuram Manyam": {
    name: "Parvathipuram Manyam",
    center: [83.4, 18.8],
    tagline: "Organic Millets, Cashew & Hill Turmeric",
    soilType: "Hilly Red Loamy & Forest Humus Soil",
    primarySeason: "Kharif & Tribal Organic Farming",
    rainfall: "1220 mm High Elevation",
    totalArrivals: "35 Tons",
    activeFarmers: 220,
    crops: [
      {
        name: "Finger Millet (Ragi)",
        variety: "VR-847 (Organic Tribal Ragi)",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop",
        arrival: "22 Tons",
        price: "₹4,350 / Q",
        priceNum: 4350,
        priceRange: "₹4,100 - ₹4,600",
        trend: "+4.6%",
        trendPositive: true,
        msp: "₹4,290 / Q",
        mandiName: "Parvathipuram Tribal Produce Yard",
        suitability: "98% (High Nutrition Match)",
        yieldPerAcre: "14 - 18 Quintals/Acre",
        yieldNum: 16,
        costPerAcre: 16000,
        estRevenuePerAcre: 69600,
        estProfitPerAcre: 53600,
        roi: "335%"
      },
      {
        name: "Cashew Nut",
        variety: "Organic Hill Grown Cashew",
        image: "/images/crops/cashew_nuts.jpg",
        arrival: "13 Tons",
        price: "₹12,400 / Q",
        priceNum: 12400,
        priceRange: "₹11,800 - ₹13,000",
        trend: "+4.1%",
        trendPositive: true,
        msp: "Market Driven",
        mandiName: "Seethampeta ITDA Market Yard",
        suitability: "96% (Organic Certified)",
        yieldPerAcre: "8 - 11 Quintals/Acre",
        yieldNum: 9.5,
        costPerAcre: 28000,
        estRevenuePerAcre: 117800,
        estProfitPerAcre: 89800,
        roi: "320%"
      }
    ]
  },
  "Alluri Sitharama Raju": {
    name: "Alluri Sitharama Raju",
    center: [82.0, 18.0],
    tagline: "Araku Valley Organic Coffee, Black Pepper & Spices",
    soilType: "Highland Forest Loam, Rich Humus & Red Soil",
    primarySeason: "Perennial Organic Hill Crops (900-1100m MSL)",
    rainfall: "1350 mm Highland Rain",
    totalArrivals: "32 Tons",
    activeFarmers: 260,
    crops: [
      {
        name: "Araku Arabica Coffee",
        variety: "GI-Tagged Single Origin Specialty Arabica",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
        arrival: "18 Tons",
        price: "₹34,500 / Q",
        priceNum: 34500,
        priceRange: "₹32,000 - ₹37,000",
        trend: "+8.2%",
        trendPositive: true,
        msp: "Coffee Board International Benchmark",
        mandiName: "Araku Valley Organic Coffee Cooperative Yard",
        suitability: "99% (Global GI Award Winner)",
        yieldPerAcre: "6 - 9 Quintals Parchment/Acre",
        yieldNum: 7.5,
        costPerAcre: 48000,
        estRevenuePerAcre: 258750,
        estProfitPerAcre: 210750,
        roi: "439%"
      },
      {
        name: "Black Pepper",
        variety: "Panniyur-1 High Piperine Organic",
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop",
        arrival: "14 Tons",
        price: "₹58,000 / Q",
        priceNum: 58000,
        priceRange: "₹54,000 - ₹62,000",
        trend: "+6.8%",
        trendPositive: true,
        msp: "Spices Board Market Rate",
        mandiName: "Paderu Spices Terminal Yard",
        suitability: "97% (Ideal Shade Canopy)",
        yieldPerAcre: "3.5 - 5 Quintals/Acre",
        yieldNum: 4.2,
        costPerAcre: 42000,
        estRevenuePerAcre: 243600,
        estProfitPerAcre: 201600,
        roi: "480%"
      }
    ]
  }
};

export const DISTRICT_LIST = Object.keys(DISTRICT_DATA);

export function normalizeDistrictName(name: string): string {
  if (!name) return "Guntur";
  const lower = name.toLowerCase().replace(/[^a-z]/g, '');
  
  if (lower.includes('alluri') || lower.includes('asr')) return "Alluri Sitharama Raju";
  if (lower.includes('anakapalli')) return "Anakapalli";
  if (lower.includes('ananthapur') || lower.includes('anantapur')) return "Ananthapur";
  if (lower.includes('annamayya')) return "Annamayya";
  if (lower.includes('bapatla')) return "Bapatla";
  if (lower.includes('chittoor')) return "Chittoor";
  if (lower.includes('konaseema') || lower.includes('ambedkar')) return "Konaseema";
  if (lower.includes('eastgodavari') || lower.includes('rajahmundry')) return "East Godavari";
  if (lower.includes('eluru')) return "Eluru";
  if (lower.includes('guntur')) return "Guntur";
  if (lower.includes('kakinada')) return "Kakinada";
  if (lower.includes('krishna') || lower.includes('machilipatnam')) return "Krishna";
  if (lower.includes('kurnool')) return "Kurnool";
  if (lower.includes('nandyal')) return "Nandyal";
  if (lower.includes('ntr') || lower.includes('vijayawada')) return "NTR";
  if (lower.includes('palnadu') || lower.includes('narasaraopet')) return "Palnadu";
  if (lower.includes('parvathipuram') || lower.includes('manyam')) return "Parvathipuram Manyam";
  if (lower.includes('prakasam') || lower.includes('ongole')) return "Prakasam";
  if (lower.includes('nellore') || lower.includes('spsr')) return "Nellore";
  if (lower.includes('sathsai') || lower.includes('sathyasai') || lower.includes('sathya')) return "Sri Sathya Sai";
  if (lower.includes('srikakulam')) return "Srikakulam";
  if (lower.includes('tirupati')) return "Tirupati";
  if (lower.includes('visakhapatnam') || lower.includes('vizag')) return "Visakhapatnam";
  if (lower.includes('vizianagaram')) return "Vizianagaram";
  if (lower.includes('westgodavari') || lower.includes('bhimavaram')) return "West Godavari";
  if (lower.includes('kadapa') || lower.includes('ysr')) return "YSR Kadapa";
  
  return name;
}

export interface DailyForecast {
  day: string;
  date: string;
  condition: string;
  icon: string;
  maxTemp: number;
  minTemp: number;
  rainProb: number;
  humidity: number;
  windSpeed: number;
  advisory: string;
}

export interface DistrictWeather {
  currentTemp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  soilMoisture: string;
  rainfallAnnual: string;
  agroAdvisory: string;
  forecast: DailyForecast[];
}

export function getDistrictWeather(districtName: string): DistrictWeather {
  const norm = normalizeDistrictName(districtName);
  const detail = DISTRICT_DATA[norm] || DISTRICT_DATA["Guntur"];
  
  const isRayalaseema = ["Ananthapur", "Kurnool", "Nandyal", "YSR Kadapa", "Annamayya", "Sri Sathya Sai", "Chittoor", "Tirupati"].includes(norm);
  const isNorthCoastal = ["Alluri Sitharama Raju", "Anakapalli", "Visakhapatnam", "Vizianagaram", "Srikakulam", "Parvathipuram Manyam"].includes(norm);
  
  const now = new Date();
  
  const forecast: DailyForecast[] = [
    {
      day: "Today",
      date: now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      condition: isRayalaseema ? "Sunny & Dry" : isNorthCoastal ? "Passing Clouds" : "Partly Sunny",
      icon: isRayalaseema ? "☀️" : isNorthCoastal ? "⛅" : "🌤️",
      maxTemp: isRayalaseema ? 35 : isNorthCoastal ? 30 : 33,
      minTemp: isRayalaseema ? 23 : isNorthCoastal ? 22 : 25,
      rainProb: isRayalaseema ? 10 : isNorthCoastal ? 35 : 20,
      humidity: isRayalaseema ? 52 : isNorthCoastal ? 82 : 72,
      windSpeed: isRayalaseema ? 14 : isNorthCoastal ? 18 : 16,
      advisory: isRayalaseema ? "Favorable for harvest drying & pod maturation." : "Ideal for morning bio-fertilizer foliar spray."
    },
    {
      day: "Tomorrow",
      date: new Date(now.getTime() + 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      condition: isRayalaseema ? "Clear Sky" : isNorthCoastal ? "Light Showers" : "Scattered Clouds",
      icon: isRayalaseema ? "☀️" : isNorthCoastal ? "🌦️" : "⛅",
      maxTemp: isRayalaseema ? 36 : isNorthCoastal ? 29 : 32,
      minTemp: isRayalaseema ? 24 : isNorthCoastal ? 21 : 24,
      rainProb: isRayalaseema ? 5 : isNorthCoastal ? 45 : 25,
      humidity: isRayalaseema ? 48 : isNorthCoastal ? 85 : 74,
      windSpeed: isRayalaseema ? 12 : isNorthCoastal ? 20 : 15,
      advisory: isNorthCoastal ? "Postpone pesticide dusting during forecast shower window." : "Schedule evening drip irrigation for optimal moisture conservation."
    },
    {
      day: new Date(now.getTime() + 172800000).toLocaleDateString('en-IN', { weekday: 'short' }),
      date: new Date(now.getTime() + 172800000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      condition: isRayalaseema ? "Warm & Breezy" : isNorthCoastal ? "Partly Cloudy" : "Moderate Humidity",
      icon: isRayalaseema ? "🌤️" : isNorthCoastal ? "⛅" : "🌤️",
      maxTemp: isRayalaseema ? 34 : isNorthCoastal ? 31 : 33,
      minTemp: isRayalaseema ? 23 : isNorthCoastal ? 22 : 25,
      rainProb: isRayalaseema ? 15 : isNorthCoastal ? 25 : 15,
      humidity: isRayalaseema ? 55 : isNorthCoastal ? 78 : 70,
      windSpeed: isRayalaseema ? 16 : isNorthCoastal ? 16 : 14,
      advisory: "Favorable conditions for inter-cultivation and weeding operations."
    },
    {
      day: new Date(now.getTime() + 259200000).toLocaleDateString('en-IN', { weekday: 'short' }),
      date: new Date(now.getTime() + 259200000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      condition: isRayalaseema ? "Clear Sky" : isNorthCoastal ? "Light Mists" : "Sunny Intervals",
      icon: isRayalaseema ? "☀️" : isNorthCoastal ? "🌫️" : "🌤️",
      maxTemp: isRayalaseema ? 35 : isNorthCoastal ? 30 : 34,
      minTemp: isRayalaseema ? 24 : isNorthCoastal ? 21 : 25,
      rainProb: isRayalaseema ? 10 : isNorthCoastal ? 30 : 10,
      humidity: isRayalaseema ? 50 : isNorthCoastal ? 80 : 68,
      windSpeed: isRayalaseema ? 14 : isNorthCoastal ? 14 : 12,
      advisory: "Excellent weather for grain packaging and warehouse transport."
    },
    {
      day: new Date(now.getTime() + 345600000).toLocaleDateString('en-IN', { weekday: 'short' }),
      date: new Date(now.getTime() + 345600000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      condition: isRayalaseema ? "Sunny" : isNorthCoastal ? "Cloudy" : "Partly Sunny",
      icon: isRayalaseema ? "☀️" : isNorthCoastal ? "☁️" : "⛅",
      maxTemp: isRayalaseema ? 36 : isNorthCoastal ? 29 : 33,
      minTemp: isRayalaseema ? 23 : isNorthCoastal ? 22 : 24,
      rainProb: isRayalaseema ? 5 : isNorthCoastal ? 40 : 20,
      humidity: isRayalaseema ? 49 : isNorthCoastal ? 84 : 73,
      windSpeed: isRayalaseema ? 13 : isNorthCoastal ? 19 : 15,
      advisory: "Maintain optimum water depth in paddy plots (2-3 cm)."
    }
  ];

  return {
    currentTemp: isRayalaseema ? 34 : isNorthCoastal ? 29 : 32,
    condition: isRayalaseema ? "Mostly Sunny" : isNorthCoastal ? "Passing Clouds" : "Partly Sunny",
    icon: isRayalaseema ? "☀️" : isNorthCoastal ? "⛅" : "🌤️",
    humidity: isRayalaseema ? 52 : isNorthCoastal ? 82 : 72,
    windSpeed: isRayalaseema ? 14 : isNorthCoastal ? 18 : 15,
    soilMoisture: isRayalaseema ? "Adequate (58%)" : isNorthCoastal ? "High (79%)" : "Optimal (68%)",
    rainfallAnnual: detail.rainfall || "850 - 1100 mm",
    agroAdvisory: isRayalaseema 
      ? `Dry, sunny agro-climate in ${norm}. Optimal for groundnut, cotton, and pulses. Conserve root-zone moisture through mulch and scheduled micro-irrigation.`
      : isNorthCoastal 
      ? `Humid coastal climate in ${norm}. Highly suitable for cashew, coconut, turmeric and oil palm. Ensure proper soil aeration and monitor for fungal humidity spots.`
      : `Fertile delta climate in ${norm} with optimal moisture. Suitable for paddy, chillies, sugarcane and pulses. Maintain regular crop scouting and field drainage.`,
    forecast
  };
}

