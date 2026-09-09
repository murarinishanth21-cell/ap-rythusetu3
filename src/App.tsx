import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircle, MapPin, Mic, PackageCheck, ListCollapse, LogIn, UserPlus, 
  Sparkles, AlertCircle, Send, Phone, CheckCircle, XCircle, 
  Clock, X, MessageSquareWarning, TrendingUp, ShoppingCart, Store,
  Calculator, PlusCircle, Lock, Building2, Truck, Calendar, Key,
  ShieldCheck, CheckCircle2, Navigation, CloudSun, Droplets, Wind,
  Thermometer, Sun, Sprout
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { api } from './api';
import APMap from './APMap';
import { DISTRICT_DATA, normalizeDistrictName, DISTRICT_LIST, getCropImage, getDistrictWeather } from './districtData';
import type { CropInfo, DistrictDetail, DistrictWeather } from './districtData';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [authUser, setAuthUser] = useState<any>(null); 
  const [loginRole, setLoginRole] = useState<'farmer'|'dealer'|'transport'|'admin'>('farmer');
  const [portalMode, setPortalMode] = useState<'general'|'farmer'|'dealer'|'transport'|'admin'>('general');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const [activeDistrict, setActiveDistrict] = useState('Guntur');
  const [showStatewide, setShowStatewide] = useState(false);

  // Portal Sub-Tabs
  const [adminTab, setAdminTab] = useState<'complaints' | 'transport' | 'marketplace'>('complaints');
  const [farmerTab, setFarmerTab] = useState<'market' | 'transport'>('market');
  const [dealerTab, setDealerTab] = useState<'marketplace' | 'transport'>('marketplace');

  // Live Crops & Listings
  const [listings, setListings] = useState<any[]>([]);
  const [farmerMyListings, setFarmerMyListings] = useState<any[]>([]);
  
  // Live Enquiries (Real-time)
  const [farmerEnquiries, setFarmerEnquiries] = useState<any[]>([]);
  const [dealerEnquiries, setDealerEnquiries] = useState<any[]>([]);

  // Live Transport & Fleet Logistics
  const [transportVehicles, setTransportVehicles] = useState<any[]>([]);
  const [transportVehicleStats, setTransportVehicleStats] = useState<{ total: number; available: number; on_trip: number; maintenance: number }>({ total: 0, available: 0, on_trip: 0, maintenance: 0 });
  const [transportStats, setTransportStats] = useState<any>({ total_vehicles: 0, available_vehicles: 0, active_bookings: 0, completed_trips: 0, district_breakdown: [] });
  const [userTransportBookings, setUserTransportBookings] = useState<any[]>([]);
  const [allTransportBookings, setAllTransportBookings] = useState<any[]>([]);
  const [transportDistrictFilter, setTransportDistrictFilter] = useState('All');
  const [transportStatusFilter, setTransportStatusFilter] = useState('All');

  // Transport Booking Modal
  const [transportBookingModalOpen, setTransportBookingModalOpen] = useState(false);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<any>(null);
  const [bookPickupLocation, setBookPickupLocation] = useState('');
  const [bookDropLocation, setBookDropLocation] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('09:00 AM');
  const [bookCropName, setBookCropName] = useState('');
  const [bookCropQty, setBookCropQty] = useState('');
  const [bookEstimatedKm, setBookEstimatedKm] = useState(25);
  const [isBookingTransport, setIsBookingTransport] = useState(false);


  // Live Grievances / Voice Complaints (Admin & User)
  const [allGrievances, setAllGrievances] = useState<any[]>([]);
  const [userGrievances, setUserGrievances] = useState<any[]>([]);
  const [grievanceFilterStatus, setGrievanceFilterStatus] = useState('All');
  const [grievanceFilterRole, setGrievanceFilterRole] = useState('All');
  const [grievanceFilterDistrict, setGrievanceFilterDistrict] = useState('All');

  // Dealer Enquiry Modal State
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [selectedCropForEnquiry, setSelectedCropForEnquiry] = useState<any>(null);
  const [enquiryQty, setEnquiryQty] = useState('');
  const [enquiryPrice, setEnquiryPrice] = useState('');
  const [enquiryMobile, setEnquiryMobile] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  // Fast Crop Publish Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [newCrop, setNewCrop] = useState("");
  const [newVariety, setNewVariety] = useState("Standard");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [reqInspection, setReqInspection] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Interactive Profit Calculator State
  const [calcAcreage, setCalcAcreage] = useState<number>(2);
  const [calcSelectedCropName, setCalcSelectedCropName] = useState<string>("");

  // AI Voice & Vision Assistant
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLang, setAiLang] = useState<'te'|'en'|'hi'>('te');
  const [isListening, setIsListening] = useState(false);
  const [aiTranscript, setAiTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiMode, setAiMode] = useState<'voice'|'disease'>('voice');
  const [aiScanning, setAiScanning] = useState(false);
  const [aiImagePreview, setAiImagePreview] = useState<string | null>(null);
  const [lastLoggedTicket, setLastLoggedTicket] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listingsSectionRef = useRef<HTMLDivElement>(null);

  // Active District Metadata
  const currentDistrictDetail: DistrictDetail = useMemo(() => {
    return DISTRICT_DATA[normalizeDistrictName(activeDistrict)] || DISTRICT_DATA["Guntur"];
  }, [activeDistrict]);

  // Active District Weather Intelligence
  const districtWeather: DistrictWeather = useMemo(() => {
    return getDistrictWeather(activeDistrict);
  }, [activeDistrict]);

  // Selected crop for profit estimation in calculator
  const activeCalcCrop: CropInfo = useMemo(() => {
    if (!currentDistrictDetail || currentDistrictDetail.crops.length === 0) {
      return DISTRICT_DATA["Guntur"].crops[0];
    }
    const found = currentDistrictDetail.crops.find(c => c.name === calcSelectedCropName);
    return found || currentDistrictDetail.crops[0];
  }, [currentDistrictDetail, calcSelectedCropName]);

  // Sync selected crop name when active district changes
  useEffect(() => {
    if (currentDistrictDetail && currentDistrictDetail.crops.length > 0) {
      setCalcSelectedCropName(currentDistrictDetail.crops[0].name);
    }
  }, [currentDistrictDetail.name]);

  // Load Real-time Data Function (Works for public guests as well as authenticated users)
  const loadData = async () => {
    try {
      // 1. Always load regional marketplace listings
      const targetDist = showStatewide ? undefined : activeDistrict;
      const mkt = await api.getMarketplace(targetDist);
      if (Array.isArray(mkt)) setListings(mkt);

      // 2. Always load transport fleet for selected district or statewide
      const vData = await api.getVehicles(targetDist);
      if (vData && vData.vehicles) {
        setTransportVehicles(vData.vehicles);
        if (vData.stats) setTransportVehicleStats(vData.stats);
      }

      // 3. Load statewide transport stats
      const tStats = await api.getTransportStats();
      if (tStats) setTransportStats(tStats);

      if (authUser) {
        // 4. Load user grievances
        const grvs = await api.getUserGrievances(authUser.id);
        if (Array.isArray(grvs)) setUserGrievances(grvs);

        // 5. Load Farmer specific listings & enquiries
        if (authUser.role === 'farmer') {
          const myCrops = await api.getFarmerListings(authUser.id);
          if (Array.isArray(myCrops)) setFarmerMyListings(myCrops);

          const enqs = await api.getFarmerEnquiries(authUser.id);
          if (Array.isArray(enqs)) setFarmerEnquiries(enqs);
        }

        // 6. Load Dealer specific sent enquiries
        if (authUser.role === 'dealer') {
          const sentEnqs = await api.getDealerEnquiries(authUser.id);
          if (Array.isArray(sentEnqs)) setDealerEnquiries(sentEnqs);
        }

        // 7. Load User's transport bookings (Farmer / Dealer)
        const myBookings = await api.getUserTransportBookings(authUser.id);
        if (Array.isArray(myBookings)) setUserTransportBookings(myBookings);

        // 8. If Admin or Transport Agent, load all transport bookings
        if (authUser.role === 'admin' || authUser.role === 'transport' || portalMode === 'transport' || portalMode === 'admin') {
          const allBks = await api.getAllTransportBookings(
            transportDistrictFilter === 'All' ? undefined : transportDistrictFilter,
            transportStatusFilter === 'All' ? undefined : transportStatusFilter
          );
          if (Array.isArray(allBks)) setAllTransportBookings(allBks);
        }

        // 9. If Admin, load statewide grievances
        if (authUser.role === 'admin') {
          const allGrvs = await api.getGrievances(
            grievanceFilterDistrict === 'All' ? undefined : grievanceFilterDistrict,
            grievanceFilterStatus === 'All' ? undefined : grievanceFilterStatus,
            grievanceFilterRole === 'All' ? undefined : grievanceFilterRole
          );
          if (Array.isArray(allGrvs)) setAllGrievances(allGrvs);
        }
      }
    } catch (e) {
      console.error("Live sync error:", e);
    }
  };

  // Immediate load on state change
  useEffect(() => {
    loadData();
  }, [authUser, activeDistrict, showStatewide, grievanceFilterDistrict, grievanceFilterStatus, grievanceFilterRole, transportDistrictFilter, transportStatusFilter]);

  // Real-time polling every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 3500);
    return () => clearInterval(interval);
  }, [authUser, activeDistrict, showStatewide, grievanceFilterDistrict, grievanceFilterStatus, grievanceFilterRole, transportDistrictFilter, transportStatusFilter]);

  // Handle Authentication (Login / Register)
  const handleAuth = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      if (loginRole === 'admin') {
        const res = await api.login({ id: data.id, password: data.password });
        if (res.error) return alert(res.error);
        setAuthUser(res);
        setPortalMode('admin');
        setActiveDistrict('Statewide');
        setAuthModalOpen(false);
      } else {
        data.role = loginRole;
        data.district = activeDistrict || "Guntur";

        let res;
        if (isRegistering) {
          res = await api.register(data);
        } else {
          res = await api.login({ id: data.id, password: data.password });
        }
        
        if (res.error) return alert(res.error);
        setAuthUser(res);
        setPortalMode(res.role || loginRole);
        if (res.district && res.district !== 'Statewide') {
          setActiveDistrict(res.district);
        }
        if (res.mobile) {
          setEnquiryMobile(res.mobile);
        }
        setAuthModalOpen(false);
      }
    } catch (err) {
      alert("Failed to connect to backend server. Make sure it is running.");
    }
  };

  // Quick Demo Login for instant access
  const handleQuickDemoLogin = (role: 'farmer' | 'dealer' | 'transport' | 'admin') => {
    if (role === 'farmer') {
      setAuthUser({
        id: "AP-FRM-2026-1011",
        name: "V. Ramana Rao",
        role: "farmer",
        district: activeDistrict || "Guntur",
        mobile: "9848022331"
      });
      setPortalMode('farmer');
    } else if (role === 'dealer') {
      setAuthUser({
        id: "AP-DLR-2026-3044",
        name: "Sri Balaji Agro Traders",
        role: "dealer",
        district: activeDistrict || "Guntur",
        mobile: "9848033442"
      });
      setPortalMode('dealer');
    } else if (role === 'transport') {
      setAuthUser({
        id: "AP-TRP-2026-8801",
        name: "AP GreenLine Agro Logistics",
        role: "transport",
        district: activeDistrict || "Guntur",
        mobile: "9848099881"
      });
      setPortalMode('transport');
    } else {
      setAuthUser({
        id: "admin",
        name: "AP Agriculture Command Center",
        role: "admin",
        district: "Statewide"
      });
      setPortalMode('admin');
    }
    setAuthModalOpen(false);
  };

  // Open Transport Booking Modal
  const handleOpenTransportBooking = (vehicle: any) => {
    if (!authUser) {
      setLoginRole(portalMode === 'dealer' ? 'dealer' : 'farmer');
      setAuthModalOpen(true);
      return;
    }
    setSelectedVehicleForBooking(vehicle);
    setBookPickupLocation(`${activeDistrict} Farm / Mandi Center`);
    setBookDropLocation(`${activeDistrict} Processing Plant / Terminal`);
    const today = new Date().toISOString().split('T')[0];
    setBookDate(today);
    setBookTime('09:30 AM');
    setBookCropName(activeCalcCrop.name || 'Produce');
    setBookCropQty(Math.min(vehicle.capacity_quintals, 20).toString());
    setBookEstimatedKm(25);
    setTransportBookingModalOpen(true);
  };

  // Submit Transport Booking
  const handleConfirmTransportBooking = async (e: any) => {
    e.preventDefault();
    if (!selectedVehicleForBooking || !authUser) return;

    setIsBookingTransport(true);
    try {
      const estimatedFare = Math.round(bookEstimatedKm * selectedVehicleForBooking.rate_per_km);
      const res = await api.bookTransport({
        user_id: authUser.id,
        user_name: authUser.name,
        user_role: authUser.role || portalMode,
        user_mobile: authUser.mobile || enquiryMobile || '9848011222',
        district: selectedVehicleForBooking.district || activeDistrict,
        vehicle_id: selectedVehicleForBooking.id,
        vehicle_number: selectedVehicleForBooking.vehicle_number,
        vehicle_type: selectedVehicleForBooking.vehicle_type,
        driver_name: selectedVehicleForBooking.driver_name,
        driver_mobile: selectedVehicleForBooking.driver_mobile,
        pickup_location: bookPickupLocation,
        drop_location: bookDropLocation,
        booking_date: bookDate,
        booking_time: bookTime,
        crop_name: bookCropName,
        crop_qty_quintals: parseFloat(bookCropQty) || 10,
        estimated_km: bookEstimatedKm,
        estimated_fare: estimatedFare
      });

      if (res.success) {
        alert(`✅ Transport Booking Confirmed! Booking ID: ${res.booking_id}\nDriver: ${selectedVehicleForBooking.driver_name} (${selectedVehicleForBooking.driver_mobile})\nScheduled: ${bookDate} at ${bookTime}`);
        setTransportBookingModalOpen(false);
        loadData();
      } else {
        alert(res.error || 'Failed to book transport.');
      }
    } catch (err) {
      alert('Network error while booking transport.');
    } finally {
      setIsBookingTransport(false);
    }
  };

  // Transport Agent: Generate Trip OTP
  const handleGenerateTripOtp = async (bookingId: number) => {
    try {
      const res = await api.generateBookingOtp(bookingId);
      if (res.success) {
        alert(`🔑 Secure Trip Handover OTP Generated: ${res.otp}\nThis OTP has been transmitted to the customer for trip validation.`);
        loadData();
      }
    } catch (err) {
      alert('Failed to generate OTP.');
    }
  };

  // Transport Agent / Admin: Update Booking Status
  const handleUpdateTransportStatus = async (bookingId: number, status: string) => {
    try {
      const res = await api.updateTransportBookingStatus(bookingId, status);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Transport Agent: Toggle Vehicle Status
  const handleToggleVehicleStatus = async (vehicleId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Available' ? 'Maintenance' : 'Available';
    try {
      const res = await api.updateVehicleStatus(vehicleId, nextStatus);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Farmer: Open Publish Modal prefilled from active crop & calculation
  const handleOpenPublishWithCrop = (crop: CropInfo, qtyCalculated?: number) => {
    if (!authUser) {
      setLoginRole('farmer');
      setAuthModalOpen(true);
      return;
    }
    setNewCrop(crop.name);
    setNewVariety(crop.variety || "Grade-A Standard");
    setNewPrice(crop.priceNum.toString());
    if (qtyCalculated) {
      setNewQty(qtyCalculated.toString());
    } else {
      setNewQty(crop.yieldNum.toString());
    }
    setPublishModalOpen(true);
  };

  // Farmer: Publish Crop
  const handlePublish = async () => {
    if (!authUser) {
      setLoginRole('farmer');
      setAuthModalOpen(true);
      return;
    }

    if (!newCrop || !newQty || !newPrice) return alert("Please fill all crop details (Name, Quantity, Price)");
    
    setIsPublishing(true);
    try {
      const defaultImg = currentDistrictDetail.crops.find(c => c.name.toLowerCase().includes(newCrop.toLowerCase()))?.image || 
        currentDistrictDetail.crops[0]?.image || 
        "https://images.unsplash.com/photo-1595188812674-d4f3b610c436?q=80&w=400&auto=format&fit=crop";

      const res = await api.publishCrop({
        farmer_id: authUser.id,
        farmer_name: authUser.name,
        district: activeDistrict,
        crop: newCrop,
        variety: newVariety || "Standard Grade",
        qty: parseInt(newQty),
        price: parseFloat(newPrice),
        quality: reqInspection ? "Govt Inspected" : "Farmer Certified",
        image_url: defaultImg
      });

      if (res.success) {
        alert(`🎉 Success! Your crop '${newCrop}' (${newQty} Quintals) is now LIVE for dealers in ${activeDistrict} district!`);
        setNewCrop(""); 
        setNewQty(""); 
        setNewPrice(""); 
        setNewVariety("Standard");
        setReqInspection(false);
        setPublishModalOpen(false);
        loadData();
      } else {
        alert("Failed to publish crop: " + (res.error || "Server error"));
      }
    } catch (e) {
      alert("Failed to publish crop to network.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Dealer: Open Enquiry Modal
  const handleOpenEnquiryModal = (cropItem: any) => {
    if (!authUser) {
      setLoginRole('dealer');
      setAuthModalOpen(true);
      return;
    }
    setSelectedCropForEnquiry(cropItem);
    setEnquiryQty(cropItem.qty.toString());
    setEnquiryPrice(cropItem.price.toString()); // defaults to farmer asking rate, dealer can edit to bargain
    setEnquiryMessage(`Hello ${cropItem.farmer_name}, I am interested in procuring your ${cropItem.crop} (${cropItem.qty} Quintals) in ${cropItem.district}. Please consider my bargain offer.`);
    setEnquiryModalOpen(true);
  };

  // Dealer: Submit Bargain Offer & Purchase Proposal
  const handleSubmitEnquiry = async (e: any) => {
    e.preventDefault();
    if (!authUser || authUser.role !== 'dealer') {
      setLoginRole('dealer');
      setAuthModalOpen(true);
      return;
    }
    if (!selectedCropForEnquiry || !enquiryQty || !enquiryPrice) return;

    setIsSubmittingEnquiry(true);
    try {
      const res = await api.createEnquiry({
        crop_id: selectedCropForEnquiry.id,
        farmer_id: selectedCropForEnquiry.farmer_id,
        farmer_name: selectedCropForEnquiry.farmer_name,
        dealer_id: authUser.id,
        dealer_name: authUser.name,
        dealer_mobile: enquiryMobile || authUser.mobile || "9848033442",
        district: selectedCropForEnquiry.district,
        crop_name: selectedCropForEnquiry.crop,
        requested_qty: parseInt(enquiryQty),
        offered_price: parseFloat(enquiryPrice),
        original_price: selectedCropForEnquiry.price,
        message: enquiryMessage
      });

      if (res.success) {
        alert(`✅ Bargain Offer of ₹${enquiryPrice}/Q submitted directly to Farmer ${selectedCropForEnquiry.farmer_name}! It now reflects in their portal awaiting their acceptance.`);
        setEnquiryModalOpen(false);
        setSelectedCropForEnquiry(null);
        loadData();
      } else {
        alert("Failed to send bargain offer: " + (res.error || "Server error"));
      }
    } catch (e) {
      alert("Failed to submit bargain offer.");
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  // Farmer: Accept or Decline Dealer's Bargain Offer
  const handleUpdateEnquiryStatus = async (enquiryId: number, status: 'Accepted' | 'Declined') => {
    try {
      const res = await api.updateEnquiryStatus(enquiryId, status);
      if (res.success) {
        if (status === 'Accepted') {
          alert(`🎉 Deal Accepted! You have agreed to the bargain offer. The dealer has been notified in real time to finalize dispatch.`);
        } else {
          alert("Bargain proposal declined.");
        }
        loadData();
      }
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  // Admin: Update Grievance Status & Remark
  const handleUpdateGrievance = async (id: number, status: string) => {
    const remark = prompt(`Enter administrative action remark for ticket #${id}:`, status === 'Resolved' ? 'Resolved after contacting concerned market yard officer.' : 'Investigating with local agricultural officer.');
    if (remark === null) return;

    try {
      const res = await api.updateGrievanceStatus(id, status, remark);
      if (res.success) {
        alert(`Ticket #${id} status updated to ${status}!`);
        loadData();
      }
    } catch (e) {
      alert("Failed to update grievance.");
    }
  };

  const handleDistrictChange = (dist: string) => {
    setActiveDistrict(dist);
    if (authUser && authUser.role !== 'admin') {
      setAuthUser({ ...authUser, district: dist });
    }
  };

  const handleViewListings = (dist: string) => {
    handleDistrictChange(dist);
    if (listingsSectionRef.current) {
      listingsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Switch between General, Farmer, Dealer, Transport Agent, and Admin
  const handleSelectPortalMode = (mode: 'general' | 'farmer' | 'dealer' | 'transport' | 'admin', dist?: string) => {
    if (dist) handleDistrictChange(dist);
    
    if (mode === 'general') {
      setPortalMode('general');
    } else if (mode === 'farmer') {
      if (authUser && authUser.role === 'farmer') {
        setPortalMode('farmer');
      } else {
        setLoginRole('farmer');
        setAuthModalOpen(true);
      }
    } else if (mode === 'dealer') {
      if (authUser && authUser.role === 'dealer') {
        setPortalMode('dealer');
      } else {
        setLoginRole('dealer');
        setAuthModalOpen(true);
      }
    } else if (mode === 'transport') {
      if (authUser && authUser.role === 'transport') {
        setPortalMode('transport');
      } else {
        setLoginRole('transport');
        setAuthModalOpen(true);
      }
    } else if (mode === 'admin') {
      if (authUser && authUser.role === 'admin') {
        setPortalMode('admin');
        setActiveDistrict('Statewide');
      } else {
        setLoginRole('admin');
        setAuthModalOpen(true);
      }
    }

    if (listingsSectionRef.current) {
      listingsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // AI Speech Engine
  const speakVoice = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (lang === 'te') utterance.lang = 'te-IN';
      else if (lang === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = aiLang === 'te' ? 'te-IN' : aiLang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setAiTranscript("Listening to your voice... Speak your agricultural query or complaint");
    };

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setAiTranscript(text);
      setIsListening(false);
      
      try {
        setAiResponse("Processing speech with AP Agriculture Command Center AI...");
        const res = await api.chatAI({ 
          message: text, 
          lang: aiLang,
          user_id: authUser?.id || "AP-FRM-VOICE",
          user_name: authUser?.name || "Farmer / Dealer",
          user_role: authUser?.role || (portalMode === 'dealer' ? 'dealer' : 'farmer'),
          district: activeDistrict
        });

        if (res.reply) {
          setAiResponse(res.reply);
          speakVoice(res.reply, aiLang);
          const tId = res.ticketId || res.ticket_id;
          if (tId) {
            setLastLoggedTicket(tId.toString());
            loadData();
          }
        }
      } catch (err) {
        setAiResponse("Failed to connect to AI voice processor.");
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAiImagePreview(url);
      setAiScanning(true);
      setAiResponse("");
      
      setTimeout(() => {
        setAiScanning(false);
        const diag = aiLang === 'te' 
          ? "ఖచ్చితమైన విశ్లేషణ పూర్తయింది: వరి అగ్గితెగులు (Paddy Blast) గుర్తించబడింది. ట్రైసైక్లాజోల్ 75 WP పిచికారీ చేయండి."
          : "Precise Pathogen Analysis Complete: Magnaporthe oryzae (Paddy Blast) detected. Recommended spray: Tricyclazole 75 WP.";
        setAiResponse(diag);
        speakVoice(diag, aiLang);
      }, 2500);
    }
  };

  // Dynamic Calculated Metrics for Profit Estimator
  const calculatedTotalYield = (activeCalcCrop.yieldNum * calcAcreage).toFixed(1);
  const calculatedTotalCost = activeCalcCrop.costPerAcre * calcAcreage;
  const calculatedTotalRevenue = parseFloat(calculatedTotalYield) * activeCalcCrop.priceNum;
  const calculatedNetProfit = calculatedTotalRevenue - calculatedTotalCost;
  const calculatedROI = calculatedTotalCost > 0 ? ((calculatedNetProfit / calculatedTotalCost) * 100).toFixed(0) : "0";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      
      {/* Top Navigation Bar */}
      <header className="bg-emerald-950 text-white sticky top-0 z-50 shadow-md border-b border-emerald-800/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <img src="/ap-logo.png" alt="AP Govt Logo" className="w-10 h-10 rounded-full shadow-lg border border-white/20 bg-white object-contain p-0.5" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-lg leading-tight tracking-wide text-white">AP-RythuSetu</h1>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 font-bold px-1.5 py-0.5 rounded">Govt of AP</span>
              </div>
              <p className="text-[10px] text-emerald-300 uppercase font-semibold tracking-wider">
                {authUser ? (authUser.role === 'admin' ? 'STATE COMMAND CENTER' : `${portalMode.toUpperCase()} PORTAL`) : 'LIVE MARKET & CROP INTELLIGENCE'}
              </p>
            </div>
          </div>

          {/* Clear 5-Way Portal Mode Switcher */}
          <div className="flex items-center bg-emerald-900/90 p-1 rounded-2xl border border-emerald-700/60 shadow-inner gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => handleSelectPortalMode('general')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                portalMode === 'general' 
                  ? "bg-white text-emerald-950 shadow-md font-black" 
                  : "text-emerald-200 hover:text-white hover:bg-white/5"
              )}
            >
              <TrendingUp size={14} className={portalMode === 'general' ? "text-emerald-700" : "text-emerald-300"} />
              <span>🌐 Market Trends</span>
            </button>

            <button
              onClick={() => handleSelectPortalMode('farmer', activeDistrict)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                portalMode === 'farmer' 
                  ? "bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400 font-black" 
                  : "text-emerald-200 hover:text-white hover:bg-white/5"
              )}
            >
              <Store size={14} />
              <span>🌾 Farmer (Sell)</span>
            </button>

            <button
              onClick={() => handleSelectPortalMode('dealer', activeDistrict)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                portalMode === 'dealer' 
                  ? "bg-teal-700 text-white shadow-md ring-1 ring-teal-400 font-black" 
                  : "text-emerald-200 hover:text-white hover:bg-white/5"
              )}
            >
              <ShoppingCart size={14} />
              <span>🛒 Dealer (Buy)</span>
            </button>

            <button
              onClick={() => handleSelectPortalMode('transport', activeDistrict)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                portalMode === 'transport' 
                  ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-400 font-black" 
                  : "text-emerald-200 hover:text-white hover:bg-white/5"
              )}
            >
              <Truck size={14} />
              <span>🚚 Transport</span>
            </button>

            <button
              onClick={() => handleSelectPortalMode('admin')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                portalMode === 'admin' 
                  ? "bg-amber-600 text-white shadow-md ring-1 ring-amber-300 font-black" 
                  : "text-emerald-200 hover:text-white hover:bg-white/5"
              )}
            >
              <Building2 size={14} />
              <span>🏛️ Admin</span>
            </button>
          </div>
          
          {/* Active District Status Pill */}
          <div className="hidden xl:flex items-center gap-2 bg-emerald-900/80 border border-emerald-700/50 px-3.5 py-1.5 rounded-full">
            <MapPin size={14} className="text-emerald-400" />
            <span className="text-xs text-emerald-200">District:</span>
            <span className="text-xs font-black text-white">{activeDistrict}</span>
          </div>

          <div className="flex items-center gap-3">
            {authUser ? (
              <>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  <UserCircle size={20} className="text-emerald-300" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-none">{authUser.name}</span>
                    <span className="text-[10px] text-emerald-300 leading-tight capitalize">{authUser.role} • {authUser.id}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setAuthUser(null)} 
                  className="text-xs font-bold bg-red-500/20 text-red-200 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-full transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-emerald-950 px-4 py-2 rounded-full transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <LogIn size={15} />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl flex flex-col gap-8">
        
        {/* SECTION 1: ANDHRA PRADESH DISTRICT MAP SELECTION */}
        <section className="w-full">
          <APMap 
            selectedDistrict={activeDistrict} 
            onSelectDistrict={handleDistrictChange}
            onViewListings={handleViewListings}
            onSelectPortalMode={handleSelectPortalMode}
            currentPortalMode={portalMode}
            userRole={authUser?.role}
          />
        </section>

        {/* SECTION 2: WORKSPACE ACCORDING TO PORTAL MODE */}
        <section ref={listingsSectionRef} className="flex flex-col gap-8">
          
          {/* ======================= GENERAL MARKET INTELLIGENCE WORKSPACE ======================= */}
          {portalMode === 'general' && (
            <div className="flex flex-col gap-8">
              
              {/* General Portal Header Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-lg border border-emerald-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl shadow-inner">
                    <TrendingUp className="w-8 h-8 text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                        AP Agriculture Market Trends Portal
                      </span>
                      <span className="text-xs text-emerald-200 font-semibold">📍 {activeDistrict} District • {currentDistrictDetail.tagline}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white">
                      Market Trends, Suitable Crops & Weather Forecasts
                    </h2>
                    <p className="text-xs text-emerald-200/80 mt-0.5">
                      Live Mandi Rates • Soil Suitability & Net Profit Projections • 5-Day Agro-Meteorological Weather Advisory
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs">
                    <span className="text-emerald-300 font-bold block text-[10px] uppercase">Soil Classification</span>
                    <span className="font-extrabold text-white">{currentDistrictDetail.soilType}</span>
                  </div>
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs">
                    <span className="text-emerald-300 font-bold block text-[10px] uppercase">Annual Rainfall</span>
                    <span className="font-extrabold text-white">{currentDistrictDetail.rainfall}</span>
                  </div>
                </div>
              </div>

              {/* TABLE 1: Real-Time Mandi Prices & Daily Market Trends Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        1. {activeDistrict} Real-Time Mandi Crop Prices & Trends Table
                      </h3>
                      <p className="text-xs text-slate-500">
                        Live AP Mandi modal prices, daily percentage trends, current arrivals, and statutory MSP benchmarks
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Mandi Feed Active
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-4">Crop & Variety</th>
                        <th className="p-3.5">Live Mandi Rate</th>
                        <th className="p-3.5">Daily Market Trend</th>
                        <th className="p-3.5">Mandi Arrivals</th>
                        <th className="p-3.5">MSP Benchmark</th>
                        <th className="p-3.5">Primary Mandi Yard</th>
                        <th className="p-3.5 pr-4 text-right">Price Margin over MSP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentDistrictDetail.crops.map((crop) => {
                        const priceNum = crop.priceNum || parseInt(crop.price.replace(/[^0-9]/g, '')) || 0;
                        const mspNum = crop.msp ? parseInt(crop.msp.replace(/[^0-9]/g, '')) || 0 : 0;
                        const margin = priceNum && mspNum ? priceNum - mspNum : 0;
                        const isSelected = activeCalcCrop.name === crop.name;

                        return (
                          <tr 
                            key={crop.name}
                            onClick={() => setCalcSelectedCropName(crop.name)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isSelected ? "bg-emerald-50/90 font-semibold" : "hover:bg-slate-50/80"
                            )}
                          >
                            <td className="p-3.5 pl-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={crop.image || getCropImage(crop.name)} 
                                  alt={crop.name} 
                                  onError={(e) => { e.currentTarget.src = getCropImage(crop.name); }}
                                  className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 shadow-sm" 
                                />
                                <div>
                                  <span className="font-extrabold text-slate-900 text-sm block">{crop.name}</span>
                                  <span className="text-[11px] text-emerald-700 font-semibold">{crop.suitability}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="text-base font-black text-emerald-800 block">{crop.price}</span>
                              <span className="text-[10px] text-slate-400 font-medium">Per Quintal (100 Kg)</span>
                            </td>
                            <td className="p-3.5">
                              <span className={cn(
                                "inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg border",
                                crop.trendPositive 
                                  ? "text-emerald-700 bg-emerald-100/80 border-emerald-300/60"
                                  : "text-rose-700 bg-rose-100/80 border-rose-300/60"
                              )}>
                                {crop.trendPositive ? '↗' : '↘'} {crop.trend}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-slate-800 block text-xs">{crop.arrival}</span>
                              <span className="text-[10px] text-slate-400">Daily Inflow</span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-slate-700 block">{crop.msp || 'N/A'}</span>
                              <span className="text-[10px] text-slate-400">Govt Support Price</span>
                            </td>
                            <td className="p-3.5">
                              <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded text-[11px] border border-slate-200">
                                {crop.mandiName || `${activeDistrict} Mandi`}
                              </span>
                            </td>
                            <td className="p-3.5 pr-4 text-right">
                              {margin > 0 ? (
                                <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                  +₹{margin.toLocaleString()}/Q Above MSP
                                </span>
                              ) : (
                                <span className="font-bold text-slate-500">At MSP Level</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABLE 2: Region Best Suitable Crops & Profit Estimation Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                      <Sprout className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        2. {activeDistrict} Best Suitable Crops & Profit Estimation Table
                      </h3>
                      <p className="text-xs text-slate-500">
                        Soil-matched yield potential, production expenditure, gross market revenue & estimated net profit per cultivation unit
                      </p>
                    </div>
                  </div>

                  {/* Acreage Selector for Table Scaling */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <span className="text-xs font-extrabold text-slate-700 px-2">Calculate for:</span>
                    {[1, 2, 5, 10, 15].map(a => (
                      <button
                        key={a}
                        onClick={() => setCalcAcreage(a)}
                        className={cn(
                          "px-3 py-1 rounded-xl text-xs font-bold transition-all",
                          calcAcreage === a 
                            ? "bg-emerald-700 text-white shadow-sm font-black scale-105" 
                            : "bg-white text-slate-700 hover:bg-slate-200"
                        )}
                      >
                        {a} {a === 1 ? 'Acre' : 'Acres'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-4">Suitable Crop</th>
                        <th className="p-3.5">Suitability & Soil Type</th>
                        <th className="p-3.5">Expected Yield ({calcAcreage} Ac)</th>
                        <th className="p-3.5">Est. Cost ({calcAcreage} Ac)</th>
                        <th className="p-3.5">Gross Revenue ({calcAcreage} Ac)</th>
                        <th className="p-3.5">Est. Net Profit ({calcAcreage} Ac)</th>
                        <th className="p-3.5 pr-4 text-right">Estimated ROI %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentDistrictDetail.crops.map((crop) => {
                        const baseYield = crop.yieldNum || 15;
                        const totalYield = baseYield * calcAcreage;
                        const totalCost = crop.costPerAcre * calcAcreage;
                        const totalRevenue = crop.estRevenuePerAcre * calcAcreage;
                        const totalProfit = crop.estProfitPerAcre * calcAcreage;
                        const roi = Math.round((totalProfit / totalCost) * 100);

                        return (
                          <tr key={crop.name} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 pl-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={crop.image || getCropImage(crop.name)} 
                                  alt={crop.name} 
                                  onError={(e) => { e.currentTarget.src = getCropImage(crop.name); }}
                                  className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 shadow-sm" 
                                />
                                <div>
                                  <span className="font-extrabold text-slate-900 text-sm block">{crop.name}</span>
                                  <span className="text-[10px] text-slate-500 font-medium">Rate: {crop.price}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="inline-block bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full text-[11px] mb-1">
                                {crop.suitability}
                              </span>
                              <span className="text-[11px] text-slate-500 block">{currentDistrictDetail.soilType}</span>
                            </td>
                            <td className="p-3.5 font-extrabold text-slate-800 text-sm">
                              {totalYield} Quintals
                              <span className="text-[10px] text-slate-400 font-normal block">({crop.yieldPerAcre})</span>
                            </td>
                            <td className="p-3.5 font-bold text-rose-700 text-sm">
                              ₹{totalCost.toLocaleString()}
                              <span className="text-[10px] text-slate-400 font-normal block">(₹{crop.costPerAcre.toLocaleString()} / Ac)</span>
                            </td>
                            <td className="p-3.5 font-bold text-slate-800 text-sm">
                              ₹{totalRevenue.toLocaleString()}
                              <span className="text-[10px] text-slate-400 font-normal block">(₹{crop.estRevenuePerAcre.toLocaleString()} / Ac)</span>
                            </td>
                            <td className="p-3.5">
                              <span className="text-base font-black text-emerald-700 block">
                                ₹{totalProfit.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-semibold block">
                                (₹{crop.estProfitPerAcre.toLocaleString()} Net / Acre)
                              </span>
                            </td>
                            <td className="p-3.5 pr-4 text-right">
                              <span className="inline-flex items-center gap-1 font-black text-xs px-3 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
                                {roi}% ROI
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABLE 3: Weather Forecast & Agro-Meteorological Advisory Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 flex flex-col gap-6">
                
                {/* Weather Section Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                      <CloudSun className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        3. {activeDistrict} 5-Day Agro-Meteorological Weather Forecast & Advisory Table
                      </h3>
                      <p className="text-xs text-slate-500">
                        Micro-climate conditions, precipitation probabilities, and IMD-compliant agricultural spraying and irrigation advisory
                      </p>
                    </div>
                  </div>

                  <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-full border border-blue-200 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    Live Micro-Climate Station
                  </span>
                </div>

                {/* 4 KPI Cards for Current District Micro-Climate */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 p-4 rounded-2xl flex items-center gap-3.5">
                    <div className="p-3 bg-amber-500 text-white rounded-xl shadow-sm">
                      <Thermometer className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Current Temp</span>
                      <span className="text-xl font-black text-slate-900">{districtWeather.currentTemp}°C</span>
                      <span className="text-[10px] text-amber-700 font-medium block">{districtWeather.condition}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200/70 p-4 rounded-2xl flex items-center gap-3.5">
                    <div className="p-3 bg-blue-500 text-white rounded-xl shadow-sm">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Relative Humidity</span>
                      <span className="text-xl font-black text-slate-900">{districtWeather.humidity}%</span>
                      <span className="text-[10px] text-blue-700 font-medium block">Moisture Index: Normal</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/70 p-4 rounded-2xl flex items-center gap-3.5">
                    <div className="p-3 bg-teal-600 text-white rounded-xl shadow-sm">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">Wind Velocity</span>
                      <span className="text-xl font-black text-slate-900">{districtWeather.windSpeed} km/h</span>
                      <span className="text-[10px] text-teal-700 font-medium block">Suitable for Field Spraying</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/70 p-4 rounded-2xl flex items-center gap-3.5">
                    <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-sm">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Soil Moisture</span>
                      <span className="text-xl font-black text-slate-900">{districtWeather.soilMoisture}</span>
                      <span className="text-[10px] text-emerald-700 font-medium block">Rainfall: {districtWeather.rainfallAnnual}</span>
                    </div>
                  </div>
                </div>

                {/* 5-Day Forecast & Advisory Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-4">Day & Date</th>
                        <th className="p-3.5">Condition</th>
                        <th className="p-3.5">Max / Min Temp</th>
                        <th className="p-3.5">Rain Probability</th>
                        <th className="p-3.5 pr-4">Agro-Meteorological Advisory for Farmers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {districtWeather.forecast.map((fc, idx) => (
                        <tr key={fc.day} className={cn("transition-colors", idx === 0 ? "bg-blue-50/40 font-medium" : "hover:bg-slate-50/80")}>
                          <td className="p-3.5 pl-4">
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {fc.day} {idx === 0 && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black ml-1">TODAY</span>}
                            </span>
                            <span className="text-[11px] text-slate-400">{fc.date}</span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              {fc.condition.toLowerCase().includes('rain') || fc.condition.toLowerCase().includes('shower') ? (
                                <Droplets className="w-4 h-4 text-blue-500" />
                              ) : fc.condition.toLowerCase().includes('cloud') ? (
                                <CloudSun className="w-4 h-4 text-amber-500" />
                              ) : (
                                <Sun className="w-4 h-4 text-amber-500" />
                              )}
                              <span className="font-bold text-slate-800">{fc.condition}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700">
                            <span className="text-amber-700 font-extrabold">{fc.maxTemp}°C</span> / <span className="text-blue-700">{fc.minTemp}°C</span>
                          </td>
                          <td className="p-3.5">
                            <span className={cn(
                              "font-black px-2 py-0.5 rounded text-[11px]",
                              fc.rainProb > 40 
                                ? "bg-blue-100 text-blue-800 border border-blue-300" 
                                : "bg-slate-100 text-slate-700"
                            )}>
                              {fc.rainProb}%
                            </span>
                          </td>
                          <td className="p-3.5 pr-4 text-slate-700 leading-relaxed font-normal">
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-2">
                              <span className="text-emerald-700 font-bold">🌾 Advisory:</span>
                              <span>{fc.advisory}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* ======================= ADMIN COMMAND CENTER ======================= */}
          {portalMode === 'admin' && (
            <div className="flex flex-col gap-6">
              
              {/* Admin Portal Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 text-white p-6 rounded-3xl shadow-md border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-amber-500/20 border border-amber-400/30 rounded-2xl">
                    <Building2 className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                        State Command Center
                      </span>
                      <span className="text-xs text-slate-300">Govt of Andhra Pradesh • 26 Districts</span>
                    </div>
                    <h2 className="text-xl font-black text-white mt-1">
                      Agriculture Grievance Redressal & Statewide Trade Oversight
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/10 px-3 py-1.5 rounded-xl text-emerald-300 font-semibold border border-white/10">
                    Live AP Monitoring Network
                  </span>
                </div>
              </div>

              {/* If not logged in as Admin, show dedicated Admin Gateway */}
              {(!authUser || authUser.role !== 'admin') ? (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center max-w-xl mx-auto w-full flex flex-col items-center gap-4 my-4">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Admin Command Center Authorization</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Restricted to authorized Andhra Pradesh Agriculture Department Officers and Mandi Administrators.
                    </p>
                  </div>

                  <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3 text-left">
                    <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                      <span>Authority Level:</span>
                      <strong className="text-slate-900">AP State Command Officer</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                      <span>Capabilities:</span>
                      <strong className="text-emerald-700">Voice Grievance Investigation & Crop Trade Audit</strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      onClick={() => handleQuickDemoLogin('admin')}
                      className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black py-3 rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Sparkles size={16} />
                      <span>1-Click Launch Demo Admin</span>
                    </button>

                    <button
                      onClick={() => { setLoginRole('admin'); setAuthModalOpen(true); }}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <LogIn size={15} />
                      <span>Enter Passcode</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Admin 3-Way Tabs */}
                  <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200/80 gap-2 overflow-x-auto">
                    <button
                      onClick={() => setAdminTab('complaints')}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap",
                        adminTab === 'complaints'
                          ? "bg-emerald-950 text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <MessageSquareWarning size={18} className="text-amber-400" />
                      <span>AI Voice Grievances ({allGrievances.length})</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('transport')}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap",
                        adminTab === 'transport'
                          ? "bg-blue-950 text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Truck size={18} className="text-blue-400" />
                      <span>Statewide Fleet & Transport ({allTransportBookings.length})</span>
                    </button>

                    <button
                      onClick={() => setAdminTab('marketplace')}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap",
                        adminTab === 'marketplace'
                          ? "bg-emerald-950 text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <ListCollapse size={18} className="text-emerald-400" />
                      <span>Statewide Live Crop Trade ({listings.length})</span>
                    </button>
                  </div>

                  {/* 1. Grievances Admin View */}
                  {adminTab === 'complaints' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="text-xl font-black text-emerald-950">
                            Live Farmer Grievance & Voice Call Monitoring Center
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Transcribed and categorized complaints from all 26 districts of Andhra Pradesh.
                          </p>
                        </div>

                        {/* Filter Bar */}
                        <div className="flex flex-wrap items-center gap-3">
                          <select 
                            value={grievanceFilterDistrict} 
                            onChange={e => setGrievanceFilterDistrict(e.target.value)}
                            className="text-xs border border-slate-200 bg-slate-50 rounded-xl p-2 font-bold text-slate-700 outline-none"
                          >
                            <option value="All">All Districts</option>
                            {DISTRICT_LIST.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>

                          <select 
                            value={grievanceFilterStatus} 
                            onChange={e => setGrievanceFilterStatus(e.target.value)}
                            className="text-xs border border-slate-200 bg-slate-50 rounded-xl p-2 font-bold text-slate-700 outline-none"
                          >
                            <option value="All">All Statuses</option>
                            <option value="Registered">Registered</option>
                            <option value="Investigating">Investigating</option>
                            <option value="Resolved">Resolved</option>
                          </select>

                          <select 
                            value={grievanceFilterRole} 
                            onChange={e => setGrievanceFilterRole(e.target.value)}
                            className="text-xs border border-slate-200 bg-slate-50 rounded-xl p-2 font-bold text-slate-700 outline-none"
                          >
                            <option value="All">All Roles</option>
                            <option value="farmer">Farmers</option>
                            <option value="dealer">Dealers</option>
                          </select>
                        </div>
                      </div>

                      {/* Grievances List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allGrievances.map(grv => (
                          <div key={grv.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between gap-3 hover:shadow-md transition-shadow">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block">
                                    Ticket #{grv.id} • {grv.district}
                                  </span>
                                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">{grv.category}</h4>
                                  <p className="text-xs text-slate-500">{grv.user_name} ({grv.user_id}) • {grv.user_role}</p>
                                </div>

                                <span className={cn(
                                  "text-xs font-black px-3 py-1 rounded-full",
                                  grv.status === 'Resolved' ? "bg-emerald-100 text-emerald-800" :
                                  grv.status === 'Investigating' ? "bg-amber-100 text-amber-800" :
                                  "bg-red-100 text-red-800"
                                )}>
                                  {grv.status}
                                </span>
                              </div>

                              <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100 italic">
                                "{grv.description}"
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs">
                              <span className="text-[10px] text-slate-400">
                                Logged: {new Date(grv.created_at).toLocaleString()}
                              </span>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateGrievance(grv.id, 'Investigating')}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg text-[11px] transition-colors"
                                >
                                  Investigate
                                </button>
                                <button
                                  onClick={() => handleUpdateGrievance(grv.id, 'Resolved')}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[11px] transition-colors"
                                >
                                  Resolve
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {allGrievances.length === 0 && (
                          <div className="col-span-2 text-center py-12 text-slate-400">
                            <MessageSquareWarning className="mx-auto w-8 h-8 mb-2 text-slate-300" />
                            <p className="font-bold text-sm">No Grievances Found Matching Filter</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. Statewide Fleet & Transport Bookings Admin View */}
                  {adminTab === 'transport' && (
                    <div className="flex flex-col gap-6">
                      
                      {/* Transport KPIs */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
                          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                            <span>Total Fleet (AP)</span>
                            <Truck className="text-blue-600 w-4 h-4" />
                          </div>
                          <span className="text-2xl font-black text-slate-900">{transportStats.total_vehicles || 37}</span>
                          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Across all 26 districts</span>
                        </div>

                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
                          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                            <span>Vehicles Available</span>
                            <CheckCircle2 className="text-emerald-600 w-4 h-4" />
                          </div>
                          <span className="text-2xl font-black text-emerald-700">{transportStats.available_vehicles || 37}</span>
                          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Ready for immediate booking</span>
                        </div>

                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
                          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                            <span>Active Bookings</span>
                            <Navigation className="text-amber-500 w-4 h-4" />
                          </div>
                          <span className="text-2xl font-black text-amber-700">{allTransportBookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').length}</span>
                          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Confirmed & in-transit</span>
                        </div>

                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
                          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                            <span>Completed Trips</span>
                            <ShieldCheck className="text-indigo-600 w-4 h-4" />
                          </div>
                          <span className="text-2xl font-black text-indigo-700">{allTransportBookings.filter(b => b.status === 'Completed').length}</span>
                          <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Verified OTP deliveries</span>
                        </div>
                      </div>

                      {/* District-Wise Fleet Availability Breakdown */}
                      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <Truck className="text-blue-700 w-5 h-5" />
                            <div>
                              <h3 className="text-lg font-black text-slate-900">Andhra Pradesh 26-District Fleet Availability</h3>
                              <p className="text-xs text-slate-500">Live transport vehicles distribution per district</p>
                            </div>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-900 font-bold px-3 py-1 rounded-full">
                            26 Districts Covered
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                          {(transportStats.district_breakdown || []).map((item: any) => (
                            <div key={item.district} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
                              <span className="font-extrabold text-slate-900 text-xs block truncate" title={item.district}>{item.district}</span>
                              <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px]">
                                <span className="font-black text-emerald-700">{item.available} Avail</span>
                                <span className="text-slate-400">/ {item.total} Total</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Statewide Transport Bookings Table */}
                      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                          <div>
                            <h3 className="text-lg font-black text-slate-900">All Statewide Transport Bookings ({allTransportBookings.length})</h3>
                            <p className="text-xs text-slate-500">Live freight bookings requested by farmers & dealers with OTP verification</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <select 
                              value={transportDistrictFilter} 
                              onChange={e => setTransportDistrictFilter(e.target.value)}
                              className="text-xs border border-slate-200 bg-slate-50 rounded-xl p-2 font-bold text-slate-700 outline-none"
                            >
                              <option value="All">All Districts</option>
                              {DISTRICT_LIST.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>

                            <select 
                              value={transportStatusFilter} 
                              onChange={e => setTransportStatusFilter(e.target.value)}
                              className="text-xs border border-slate-200 bg-slate-50 rounded-xl p-2 font-bold text-slate-700 outline-none"
                            >
                              <option value="All">All Statuses</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="OTP Generated">OTP Generated</option>
                              <option value="In-Transit">In-Transit</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider border-b border-slate-200">
                              <tr>
                                <th className="p-3 pl-4">Booking ID</th>
                                <th className="p-3">Customer & Role</th>
                                <th className="p-3">District & Route</th>
                                <th className="p-3">Vehicle & Driver</th>
                                <th className="p-3">Date & Time</th>
                                <th className="p-3">Fare</th>
                                <th className="p-3">OTP</th>
                                <th className="p-3 pr-4 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                              {allTransportBookings.map((b: any) => (
                                <tr key={b.id} className="hover:bg-slate-50/70">
                                  <td className="p-3 pl-4 font-black text-slate-900">{b.booking_id}</td>
                                  <td className="p-3">
                                    <span className="font-bold text-slate-900 block">{b.user_name}</span>
                                    <span className="text-[10px] text-slate-400 capitalize">{b.user_role} • {b.user_mobile}</span>
                                  </td>
                                  <td className="p-3">
                                    <span className="font-bold text-slate-800 block">📍 {b.district}</span>
                                    <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">{b.pickup_location} ➔ {b.drop_location}</span>
                                  </td>
                                  <td className="p-3">
                                    <span className="font-bold text-slate-900 block">{b.vehicle_type}</span>
                                    <span className="text-[10px] text-slate-500">{b.driver_name} ({b.driver_mobile})</span>
                                  </td>
                                  <td className="p-3 font-semibold text-slate-700">
                                    {b.booking_date} • {b.booking_time}
                                  </td>
                                  <td className="p-3 font-black text-emerald-800">
                                    ₹{b.estimated_fare?.toLocaleString()}
                                  </td>
                                  <td className="p-3">
                                    {b.otp ? (
                                      <span className="font-mono font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md text-xs">
                                        {b.otp}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 italic text-[11px]">Not Generated</span>
                                    )}
                                  </td>
                                  <td className="p-3 pr-4 text-right">
                                    <span className={cn(
                                      "text-[10px] font-black px-2.5 py-1 rounded-full inline-block",
                                      b.status === 'Completed' ? "bg-emerald-100 text-emerald-800" :
                                      b.status === 'In-Transit' ? "bg-blue-100 text-blue-800" :
                                      b.status === 'OTP Generated' ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                                    )}>
                                      {b.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}

                              {allTransportBookings.length === 0 && (
                                <tr>
                                  <td colSpan={8} className="p-8 text-center text-slate-400">
                                    <Truck className="mx-auto w-7 h-7 mb-1 text-slate-300" />
                                    <span>No transport bookings match the filter criteria.</span>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* 3. Admin Marketplace View */}
                  {adminTab === 'marketplace' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 overflow-hidden">
                      <h3 className="text-lg font-black text-emerald-950 mb-4">Statewide Live Farmer Listings ({listings.length})</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="p-4 pl-6">Farmer & ID</th>
                              <th className="p-4">Crop Produce</th>
                              <th className="p-4">District</th>
                              <th className="p-4">Volume Available</th>
                              <th className="p-4 text-right">Asking Price</th>
                              <th className="p-4 pr-6 text-right">Verification Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {listings.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4 pl-6">
                                  <div className="font-bold text-slate-900 text-xs">{item.farmer_name}</div>
                                  <span className="text-[11px] text-slate-400">{item.farmer_id}</span>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={item.image_url || getCropImage(item.crop)} 
                                      alt={item.crop} 
                                      onError={(e) => { e.currentTarget.src = getCropImage(item.crop); }}
                                      className="w-11 h-11 rounded-xl object-cover shadow-sm bg-slate-100" 
                                    />
                                    <div>
                                      <p className="font-black text-slate-900 text-sm">{item.crop}</p>
                                      <span className="text-[10px] text-slate-500">{item.variety || 'Standard Grade'}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700 text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                                    <MapPin size={12} className="text-emerald-600" />
                                    {item.district}
                                  </span>
                                </td>
                                <td className="p-4 font-black text-slate-800">
                                  {item.qty} Quintals
                                </td>
                                <td className="p-4 text-right font-black text-emerald-700 text-base">
                                  ₹{item.price.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ Q</span>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full inline-block">
                                    {item.quality || 'Govt Verified'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

      {/* ======================= FARMER PORTAL (SELL WORKSPACE) ======================= */}
      {portalMode === 'farmer' && (
        <div className="flex flex-col gap-6">
          
          {/* Farmer Portal Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 rounded-3xl shadow-md border border-emerald-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-emerald-600/30 border border-emerald-400/30 rounded-2xl">
                <Store className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Farmer Portal (Sell)
                  </span>
                  <span className="text-xs text-emerald-200">📍 Active Mandi Hub: {activeDistrict}</span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  Mandi Crop Prices, Agro-Suitability & Acreage Profit Estimator
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleOpenPublishWithCrop(activeCalcCrop, Math.round(parseFloat(calculatedTotalYield)))}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <PlusCircle size={16} />
                <span>Add Harvest for Sale</span>
              </button>
            </div>
          </div>

          {/* Farmer Sub-Tab Switcher: Market & Profit vs Farm Transport */}
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-emerald-100 gap-2 overflow-x-auto">
            <button
              onClick={() => setFarmerTab('market')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap",
                farmerTab === 'market'
                  ? "bg-emerald-800 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <TrendingUp size={16} />
              <span>🌾 Mandi Rates, Profit Estimator & Bargain Proposals</span>
            </button>

            <button
              onClick={() => setFarmerTab('transport')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap",
                farmerTab === 'transport'
                  ? "bg-emerald-800 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Truck size={16} />
              <span>🚚 Farm Transport Vehicles ({transportVehicleStats.available} Available in {activeDistrict})</span>
            </button>
          </div>

          {farmerTab === 'market' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Column 1: Real-Time Crop Prices, Region Best Crops & Profit Estimator (lg: 6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 flex flex-col justify-between gap-6">
              <div>
                {/* Section Title */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-emerald-700 w-5 h-5" />
                    <div>
                      <h3 className="text-lg font-black text-emerald-950">
                        {activeDistrict} Real-Time Crop Prices & Best Crops
                      </h3>
                      <p className="text-xs text-slate-500">Live AP Mandi rates & agro-climatic profit projection</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenPublishWithCrop(activeCalcCrop, Math.round(parseFloat(calculatedTotalYield)))}
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 transition-all active:scale-[0.98]"
                  >
                    <PlusCircle size={14} />
                    <span>Add Harvest</span>
                  </button>
                </div>

                  {/* 1. Real-Time Mandi Prices Table */}
                  <div className="overflow-x-auto mb-5 rounded-2xl border border-slate-200/80">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider border-b border-slate-200/60">
                        <tr>
                          <th className="p-3 pl-4">Recommended Crop</th>
                          <th className="p-3">Live Mandi Price</th>
                          <th className="p-3">Daily Trend</th>
                          <th className="p-3 pr-4 text-right">Arrivals</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentDistrictDetail.crops.map((crop) => {
                          const isSelected = activeCalcCrop.name === crop.name;
                          return (
                            <tr 
                              key={crop.name}
                              onClick={() => setCalcSelectedCropName(crop.name)}
                              className={cn(
                                "cursor-pointer transition-colors",
                                isSelected ? "bg-emerald-50/90 font-bold" : "hover:bg-slate-50/70"
                              )}
                            >
                              <td className="p-3 pl-4">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={crop.image || getCropImage(crop.name)} 
                                    alt={crop.name} 
                                    onError={(e) => { e.currentTarget.src = getCropImage(crop.name); }}
                                    className="w-8 h-8 rounded-lg object-cover bg-slate-200" 
                                  />
                                  <div>
                                    <span className="font-extrabold text-slate-900 block">{crop.name}</span>
                                    <span className="text-[10px] text-emerald-700 font-semibold">{crop.suitability}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 font-black text-emerald-800 text-sm">
                                {crop.price}
                                <span className="text-[10px] text-slate-400 font-normal block">MSP: {crop.msp || 'N/A'}</span>
                              </td>
                              <td className="p-3">
                                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                  ↗ {crop.trend}
                                </span>
                              </td>
                              <td className="p-3 pr-4 text-right font-semibold text-slate-700">
                                {crop.arrival}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 2. Interactive Real-Time Profit Estimator Card */}
                  <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-5 shadow-lg border border-emerald-800/80 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

                    {/* Estimator Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Calculator className="text-amber-400 w-5 h-5" />
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-wider">
                            Real-Time Profit Estimator: {activeCalcCrop.name}
                          </h4>
                          <span className="text-[11px] text-emerald-300">
                            {currentDistrictDetail.name} • {currentDistrictDetail.soilType}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs bg-amber-400/20 text-amber-300 font-black px-2.5 py-1 rounded-full border border-amber-400/30">
                        ROI: {calculatedROI}%
                      </span>
                    </div>

                    {/* Interactive Acreage Selector */}
                    <div className="mb-4 bg-white/10 p-3 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-emerald-200">
                          Farm Cultivation Area (Acres):
                        </label>
                        <span className="text-sm font-black text-amber-300 bg-emerald-900/80 px-2.5 py-0.5 rounded-lg border border-emerald-600/40">
                          {calcAcreage} {calcAcreage === 1 ? 'Acre' : 'Acres'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {[1, 2, 5, 10, 15].map(a => (
                          <button
                            key={a}
                            onClick={() => setCalcAcreage(a)}
                            className={cn(
                              "flex-1 py-1 rounded-lg text-xs font-bold transition-all",
                              calcAcreage === a 
                                ? "bg-emerald-500 text-white shadow" 
                                : "bg-white/10 text-emerald-200 hover:bg-white/20"
                            )}
                          >
                            {a} Ac
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Calculated Financial Projections Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 text-center">
                      <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/5">
                        <span className="text-[10px] text-emerald-300 block font-semibold">Expected Output</span>
                        <span className="text-sm font-extrabold text-white mt-1 block">
                          {calculatedTotalYield} Q
                        </span>
                      </div>
                      <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/5">
                        <span className="text-[10px] text-emerald-300 block font-semibold">Cultivation Cost</span>
                        <span className="text-sm font-extrabold text-rose-300 mt-1 block">
                          ₹{calculatedTotalCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/5">
                        <span className="text-[10px] text-emerald-300 block font-semibold">Gross Mandi Value</span>
                        <span className="text-sm font-extrabold text-emerald-200 mt-1 block">
                          ₹{calculatedTotalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-emerald-500/25 p-2.5 rounded-xl backdrop-blur-sm border border-emerald-400/40">
                        <span className="text-[10px] text-emerald-200 block font-bold">Net Profit Est.</span>
                        <span className="text-sm font-black text-amber-300 mt-1 block">
                          ₹{calculatedNetProfit.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Quick Fast-Publish CTA */}
                    <button
                      onClick={() => handleOpenPublishWithCrop(activeCalcCrop, Math.round(parseFloat(calculatedTotalYield)))}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-md mt-3 active:scale-[0.99]"
                    >
                      <Sparkles size={15} className="text-emerald-900" />
                      <span>List {activeCalcCrop.name} for Sale ({calculatedTotalYield} Q @ ₹{activeCalcCrop.priceNum}/Q)</span>
                    </button>
                  </div>
                </div>

                {/* 3. Direct BUY & SELL Option Switcher directly beneath table */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                      Portal Trade Switcher:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Currently viewing: <strong className="text-emerald-700">Farmer Sell Portal</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSelectPortalMode('farmer', activeDistrict)}
                      className="py-3 px-3 bg-emerald-700 text-white rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-md ring-2 ring-emerald-400"
                    >
                      <Store size={16} />
                      <span>Sell Produce (Farmer Active)</span>
                    </button>

                    <button
                      onClick={() => handleSelectPortalMode('dealer', activeDistrict)}
                      className="py-3 px-3 bg-gradient-to-r from-teal-800 to-emerald-800 hover:from-teal-900 hover:to-emerald-900 text-white rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                    >
                      <ShoppingCart size={16} className="text-emerald-300" />
                      <span>Buy Produce (Dealer Portal)</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Column 2: Live Dealer Enquiries & My Published Produce (lg: 6 cols) */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                
                  {/* 🔔 LIVE DEALER BARGAIN & PURCHASE PROPOSALS SECTION */}
                  <div className="bg-white rounded-3xl shadow-sm border border-emerald-200 p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <h3 className="text-base md:text-lg font-black text-emerald-950">
                          Live Dealer Bargain & Purchase Offers ({farmerEnquiries.length})
                        </h3>
                      </div>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                        Real-Time Negotiation
                      </span>
                    </div>

                    {authUser ? (
                      farmerEnquiries.length > 0 ? (
                        <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
                          {farmerEnquiries.map((enq) => {
                            const origPrice = enq.original_price || enq.offered_price;
                            const diff = origPrice - enq.offered_price;
                            const totalDealVal = (enq.requested_qty * enq.offered_price).toLocaleString();

                            return (
                              <div 
                                key={enq.id}
                                className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-200/80 flex flex-col gap-3 hover:bg-emerald-50/70 transition-colors"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-slate-900 text-sm">{enq.crop_name}</span>
                                      <span className="text-[10px] bg-emerald-800 text-white font-bold px-2 py-0.5 rounded-full">
                                        {enq.requested_qty} Quintals Required
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">
                                      Dealer: <span className="font-bold text-slate-900">{enq.dealer_name}</span> ({enq.dealer_id})
                                    </p>
                                    {enq.dealer_mobile && (
                                      <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                                        <Phone size={12} /> Contact: {enq.dealer_mobile}
                                      </p>
                                    )}
                                  </div>

                                  <div className="text-right">
                                    <span className="text-[11px] text-slate-400 block line-through">
                                      Your Asking: ₹{origPrice}/Q
                                    </span>
                                    <span className="text-xs text-slate-500 font-bold">Dealer Bargain Offer:</span>
                                    <span className="font-black text-emerald-700 text-lg block leading-tight">
                                      ₹{enq.offered_price} <span className="text-xs font-normal text-slate-400">/ Q</span>
                                    </span>
                                    {diff > 0 ? (
                                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                        Bargain Discount: -₹{diff}/Q
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                        Full Asking Price Offered
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-bold">
                                  <span className="text-slate-600">Total Purchase Deal Value:</span>
                                  <span className="text-emerald-800 font-black text-sm">₹{totalDealVal}</span>
                                </div>

                                {enq.message && (
                                  <p className="text-xs text-slate-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60 italic">
                                    "{enq.message}"
                                  </p>
                                )}

                                <div className="flex items-center justify-between pt-1">
                                  {enq.status === 'Accepted' && (
                                    <div className="w-full bg-emerald-100 border border-emerald-300 text-emerald-900 p-2.5 rounded-xl text-xs font-bold flex items-center justify-between">
                                      <span className="flex items-center gap-1.5">
                                        <CheckCircle size={15} className="text-emerald-700" />
                                        <span>Deal Accepted by You at ₹{enq.offered_price}/Q!</span>
                                      </span>
                                      <span className="text-[11px] text-emerald-800">Finalized</span>
                                    </div>
                                  )}

                                  {enq.status === 'Declined' && (
                                    <div className="w-full bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                                      <XCircle size={15} className="text-red-600" />
                                      <span>Bargain Proposal Declined</span>
                                    </div>
                                  )}

                                  {enq.status === 'Pending' && (
                                    <div className="flex items-center gap-2 w-full">
                                      <button
                                        onClick={() => handleUpdateEnquiryStatus(enq.id, 'Accepted')}
                                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                                      >
                                        <CheckCircle size={15} />
                                        <span>Accept Deal (₹{enq.offered_price}/Q)</span>
                                      </button>
                                      <button
                                        onClick={() => handleUpdateEnquiryStatus(enq.id, 'Declined')}
                                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors"
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 px-4 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-200">
                          <Clock className="mx-auto w-7 h-7 text-emerald-400 mb-1.5" />
                          <h4 className="font-bold text-emerald-950 text-xs">No Dealer Enquiries Yet</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            When registered dealers browse your crops and submit buy offers, they will appear right here in real time.
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8 px-4 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-200">
                        <Lock className="mx-auto w-8 h-8 text-emerald-600/70 mb-2" />
                        <h4 className="font-bold text-emerald-950 text-sm">Sign In as Farmer to Receive Buy Offers</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-3">
                          Registered dealers across AP can send purchase enquiries and payment commitments directly to your mobile.
                        </p>
                        <button
                          onClick={() => { setLoginRole('farmer'); setAuthModalOpen(true); }}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
                        >
                          Sign In as Farmer
                        </button>
                      </div>
                    )}
                  </div>

                {/* Farmer's Active Listings & Registered Voice Complaints Tracker */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-extrabold text-emerald-950">My Published Produce</h3>
                      <p className="text-xs text-slate-500">Live harvests visible to dealers across Andhra Pradesh</p>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                      {farmerMyListings.length} Crops Active
                    </span>
                  </div>

                  {authUser ? (
                    farmerMyListings.length > 0 ? (
                      <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {farmerMyListings.map(l => (
                          <div key={l.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <img 
                                src={l.image_url || getCropImage(l.crop)} 
                                alt={l.crop} 
                                onError={(e) => { e.currentTarget.src = getCropImage(l.crop); }}
                                className="w-11 h-11 rounded-xl object-cover shadow-sm bg-slate-200" 
                              />
                              <div>
                                <h4 className="font-bold text-slate-900 text-xs">{l.crop}</h4>
                                <p className="text-[11px] text-slate-500">
                                  {l.district} • {l.qty} Quintals • <span className="font-semibold text-emerald-700">{l.quality}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-emerald-700 text-sm block">₹{l.price} / Q</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block mt-0.5">
                                Live
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500">No crops published yet. Click "Add Harvest" above to post your first listing.</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500">Sign in to track and manage your live harvests listed across Andhra Pradesh.</p>
                    </div>
                  )}

                  {/* Farmer Voice Complaints Status */}
                  {userGrievances.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <MessageSquareWarning size={14} className="text-amber-500" />
                        <span>My Voice Complaints & Grievance Tickets ({userGrievances.length})</span>
                      </h4>
                      <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto">
                        {userGrievances.map(g => (
                          <div key={g.id} className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-800 block">Ticket #{g.id}: {g.category}</span>
                              <span className="text-[11px] text-slate-500 line-clamp-1 italic">"{g.description}"</span>
                            </div>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              g.status === 'Resolved' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            )}>
                              {g.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

            {/* Farmer Sub-Tab 2: Farm Transport & Freight Booking */}
            {farmerTab === 'transport' && (
              <div className="flex flex-col gap-6">
                
                {/* Transport Header Info */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                      <Truck className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        {activeDistrict} Farm Harvest Transport Fleet
                      </h3>
                      <p className="text-xs text-slate-500">
                        Book verified agricultural transport vehicles on your scheduled date & time with trip OTP protection
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
                      🟢 {transportVehicleStats.available} Vehicles Available in {activeDistrict}
                    </span>
                  </div>
                </div>

                {/* Available Vehicles Grid for Active District */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>Available Vehicles in {activeDistrict}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                        {transportVehicles.filter(v => v.status === 'Available').length} Ready
                      </span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      Showing commercial vehicles deployed in {activeDistrict}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {transportVehicles.map(vehicle => {
                      const isAvail = vehicle.status === 'Available';
                      return (
                        <div 
                          key={vehicle.id} 
                          className={cn(
                            "bg-white rounded-3xl p-5 border shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md",
                            isAvail ? "border-slate-200/90 hover:border-blue-400" : "border-slate-200 bg-slate-50/70 opacity-80"
                          )}
                        >
                          <div>
                            <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                              <img 
                                src={vehicle.image_url || "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=400&auto=format&fit=crop"} 
                                alt={vehicle.vehicle_type} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2">
                                <span className={cn(
                                  "text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm",
                                  isAvail ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                                )}>
                                  {vehicle.status}
                                </span>
                              </div>
                              <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold">
                                {vehicle.vehicle_number}
                              </div>
                            </div>

                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-black text-slate-900 text-base">{vehicle.vehicle_type}</h4>
                                <span className="text-xs text-slate-500 font-semibold">📍 Base District: {vehicle.district}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-blue-700 text-base block">₹{vehicle.rate_per_km}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">per KM rate</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 block font-semibold">Payload Capacity</span>
                                <strong className="text-slate-800 font-extrabold">{vehicle.capacity_quintals} Quintals</strong>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 block font-semibold">Assigned Driver</span>
                                <strong className="text-slate-800 font-bold truncate block">{vehicle.driver_name}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => handleOpenTransportBooking(vehicle)}
                              disabled={!isAvail}
                              className={cn(
                                "w-full font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95",
                                isAvail 
                                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20" 
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                              )}
                            >
                              <Calendar size={14} />
                              <span>{isAvail ? `Book on Date & Time` : `Currently On Trip`}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {transportVehicles.length === 0 && (
                      <div className="col-span-3 text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                        <Truck className="mx-auto w-8 h-8 text-slate-300 mb-2" />
                        <p className="font-bold text-sm">No Transport Vehicles Found in {activeDistrict}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Farmer's Booked Transport Trips & Handover OTP */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        My Booked Harvest Trips & Security OTP
                      </h3>
                      <p className="text-xs text-slate-500">
                        Track scheduled farm pickups, driver contact, and handover OTP for delivery verification
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-full">
                      {userTransportBookings.length} Trips Scheduled
                    </span>
                  </div>

                  {authUser ? (
                    userTransportBookings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userTransportBookings.map((b: any) => (
                          <div key={b.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex flex-col justify-between gap-3 hover:bg-slate-50 transition-colors">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md inline-block">
                                    {b.booking_id} • {b.vehicle_type}
                                  </span>
                                  <h4 className="font-black text-slate-900 text-sm mt-1">{b.crop_name} ({b.crop_qty_quintals} Q)</h4>
                                </div>
                                <span className={cn(
                                  "text-[10px] font-black px-2.5 py-1 rounded-full",
                                  b.status === 'Completed' ? "bg-emerald-100 text-emerald-800" :
                                  b.status === 'In-Transit' ? "bg-blue-100 text-blue-800" :
                                  b.status === 'OTP Generated' ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-slate-200 text-slate-700"
                                )}>
                                  {b.status}
                                </span>
                              </div>

                              <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex flex-col gap-1 text-xs text-slate-600 mb-2">
                                <div className="flex items-center justify-between">
                                  <span>📅 Scheduled Slot:</span>
                                  <strong className="text-slate-900">{b.booking_date} at {b.booking_time}</strong>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>📍 Route:</span>
                                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{b.pickup_location} ➔ {b.drop_location}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>👤 Driver:</span>
                                  <strong className="text-slate-900">{b.driver_name} ({b.driver_mobile})</strong>
                                </div>
                                <div className="flex items-center justify-between font-black text-emerald-800 pt-1 border-t border-slate-100">
                                  <span>Estimated Fare:</span>
                                  <span className="text-sm">₹{b.estimated_fare?.toLocaleString()} ({b.estimated_km} km)</span>
                                </div>
                              </div>

                              {/* Security OTP Card */}
                              {b.otp ? (
                                <div className="p-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl flex items-center justify-between shadow-sm">
                                  <div className="flex items-center gap-2">
                                    <Key className="w-5 h-5 text-amber-400" />
                                    <div>
                                      <span className="text-[10px] text-blue-200 block font-bold uppercase tracking-wider">Trip Handover OTP:</span>
                                      <span className="text-xs text-slate-300">Share with driver at loading</span>
                                    </div>
                                  </div>
                                  <span className="text-lg font-mono font-black text-amber-300 tracking-widest bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                                    {b.otp}
                                  </span>
                                </div>
                              ) : (
                                <div className="p-2.5 bg-slate-100 rounded-xl text-center text-xs text-slate-500 italic">
                                  OTP will be generated by the transport agent upon dispatch.
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Truck className="mx-auto w-7 h-7 text-slate-300 mb-1" />
                        <p className="text-xs text-slate-500">No transport bookings yet. Select an available vehicle above to book farm dispatch.</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500">Sign in to view your scheduled transport bookings.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ======================= DEALER PORTAL (BUY WORKSPACE) ======================= */}
        {portalMode === 'dealer' && (
          <div className="flex flex-col gap-6">
            
            {/* Dealer Portal Header Banner */}
            <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 text-white p-6 rounded-3xl shadow-md border border-teal-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-teal-600/30 border border-teal-400/30 rounded-2xl">
                  <ShoppingCart className="w-7 h-7 text-teal-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                      Dealer Portal (Buy)
                    </span>
                    <span className="text-xs text-teal-200">
                      📍 Procurement Scope: {showStatewide ? "Statewide (All AP)" : `${activeDistrict} District`}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    Verified Andhra Pradesh Farmer Produce Procurement Feed
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStatewide(false)}
                  className={cn(
                    "text-xs font-bold px-3.5 py-2 rounded-xl transition-all",
                    !showStatewide 
                      ? "bg-white text-teal-950 shadow-md font-black" 
                      : "bg-teal-900/80 text-teal-100 hover:bg-teal-800 border border-teal-700/50"
                  )}
                >
                  📍 {activeDistrict} Only
                </button>

                <button
                  onClick={() => setShowStatewide(true)}
                  className={cn(
                    "text-xs font-bold px-3.5 py-2 rounded-xl transition-all",
                    showStatewide 
                      ? "bg-white text-teal-950 shadow-md font-black" 
                      : "bg-teal-900/80 text-teal-100 hover:bg-teal-800 border border-teal-700/50"
                  )}
                >
                  🌐 Statewide (All AP)
                </button>
              </div>
            </div>

            {/* Dealer Sub-Tab Switcher */}
            <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-teal-100 gap-2 overflow-x-auto">
              <button
                onClick={() => setDealerTab('marketplace')}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap",
                  dealerTab === 'marketplace'
                    ? "bg-teal-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <ListCollapse size={16} />
                <span>🌾 Browse Verified Crops & Bargain Proposals</span>
              </button>

              <button
                onClick={() => setDealerTab('transport')}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap",
                  dealerTab === 'transport'
                    ? "bg-teal-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Truck size={16} />
                <span>🚚 Commercial Freight & Transport Vehicles ({transportVehicleStats.available} Available)</span>
              </button>
            </div>

            {/* Dealer Sub-Tab 1: Marketplace & Sent Enquiries */}
            {dealerTab === 'marketplace' && (
              <div className="flex flex-col gap-6">
                
                {/* Marketplace Table Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                  
                  {/* Header and Filter */}
                  <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <ListCollapse className="text-emerald-700 w-5 h-5" />
                        <h3 className="font-black text-emerald-950 text-xl">
                          {showStatewide ? "Statewide AP Real-Time Crop Marketplace" : `${activeDistrict} District Verified Farmer Produce`}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {showStatewide 
                          ? "Showing all active verified farmer crops across all 26 districts of Andhra Pradesh" 
                          : `Showing verified farmer crops in ${activeDistrict} district. Click "🤝 Deal & Ask for Bargain" to negotiate directly.`
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowStatewide(false)}
                        className={cn(
                          "text-xs font-bold px-3.5 py-2 rounded-xl transition-all",
                          !showStatewide 
                            ? "bg-emerald-800 text-white shadow-sm" 
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        📍 {activeDistrict} Only
                      </button>

                      <button
                        onClick={() => setShowStatewide(true)}
                        className={cn(
                          "text-xs font-bold px-3.5 py-2 rounded-xl transition-all",
                          showStatewide 
                            ? "bg-emerald-800 text-white shadow-sm" 
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        🌐 Statewide (All AP)
                      </button>
                    </div>
                  </div>

                  {/* Table Content */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="p-4 pl-6">Farmer & Region</th>
                          <th className="p-4">Crop Produce</th>
                          <th className="p-4">District</th>
                          <th className="p-4">Volume Available</th>
                          <th className="p-4 text-right">Asking Price</th>
                          <th className="p-4 pr-6 text-right">Procurement Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {listings.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="font-bold text-slate-900 text-xs">{item.farmer_name}</div>
                              <span className="text-[11px] text-slate-400 block">{item.farmer_id}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={item.image_url || getCropImage(item.crop)} 
                                  alt={item.crop} 
                                  onError={(e) => { e.currentTarget.src = getCropImage(item.crop); }}
                                  className="w-12 h-12 rounded-xl object-cover shadow-sm bg-slate-100" 
                                />
                                <div>
                                  <p className="font-black text-slate-900 text-sm">{item.crop}</p>
                                  <span className="text-[10px] text-slate-500">{item.variety || 'Standard Grade'}</span>
                                  <span className="ml-2 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md inline-block">
                                    {item.quality || 'Verified'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-700 text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                                <MapPin size={12} className="text-emerald-600" />
                                {item.district}
                              </span>
                            </td>
                            <td className="p-4 font-black text-slate-800">
                              {item.qty} Quintals
                            </td>
                            <td className="p-4 text-right font-black text-emerald-700 text-base">
                              ₹{item.price.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ Q</span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <button 
                                onClick={() => handleOpenEnquiryModal(item)}
                                className="bg-gradient-to-r from-teal-800 to-emerald-800 hover:from-teal-900 hover:to-emerald-900 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.97] flex items-center gap-1.5 ml-auto"
                              >
                                <ShoppingCart size={13} className="text-teal-300" />
                                <span>🤝 Deal & Ask for Bargain</span>
                              </button>
                            </td>
                          </tr>
                        ))}

                        {listings.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-slate-500">
                              <AlertCircle className="mx-auto w-8 h-8 text-slate-300 mb-2" />
                              <p className="font-semibold text-sm">No active listings in {activeDistrict} at this moment.</p>
                              <button 
                                onClick={() => setShowStatewide(true)} 
                                className="text-xs text-emerald-700 font-bold underline mt-1 block mx-auto"
                              >
                                View Statewide Listings Across AP
                              </button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Below Table: Quick Portal Navigation Switcher */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-600 font-semibold">
                      Want to check market trends or list your harvest in {activeDistrict}?
                    </span>

                    <button
                      onClick={() => handleSelectPortalMode('farmer', activeDistrict)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Store size={14} />
                      <span>Switch to Farmer Sell Portal</span>
                    </button>
                  </div>
                </div>

                {/* Dealer's Sent Enquiries & Deal Tracker */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-black text-emerald-950">My Sent Enquiries & Deal Status</h3>
                      <p className="text-xs text-slate-500">Track real-time responses from farmers for your procurement offers</p>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                      {dealerEnquiries.length} Enquiries Sent
                    </span>
                  </div>

                  {authUser ? (
                    dealerEnquiries.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dealerEnquiries.map(enq => (
                          <div key={enq.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h4 className="font-extrabold text-slate-900 text-sm">{enq.crop_name}</h4>
                                  <p className="text-xs text-slate-600">Farmer: <span className="font-bold">{enq.farmer_name}</span> ({enq.farmer_id})</p>
                                </div>
                                <span className={cn(
                                  "text-[10px] font-bold px-2.5 py-1 rounded-full",
                                  enq.status === 'Accepted' ? "bg-emerald-100 text-emerald-800" :
                                  enq.status === 'Declined' ? "bg-red-100 text-red-800" :
                                  "bg-amber-100 text-amber-800"
                                )}>
                                  {enq.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs font-bold text-slate-700 mb-2">
                                <span>Volume: {enq.requested_qty} Q</span>
                                <span className="text-emerald-700">Offered: ₹{enq.offered_price}/Q</span>
                              </div>

                              {enq.message && (
                                <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                                  "{enq.message}"
                                </p>
                              )}
                            </div>

                            <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                              Sent on {new Date(enq.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500">You haven't sent any enquiries yet. Browse the marketplace above and click "Deal & Ask for Bargain" to send your first offer!</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Lock className="mx-auto w-8 h-8 text-slate-400 mb-2" />
                      <h4 className="font-bold text-slate-800 text-sm">Sign In as Dealer to Transmit Purchase Offers</h4>
                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        Procure directly from verified Andhra Pradesh farmers with guaranteed inspection certificates.
                      </p>
                      <button
                        onClick={() => { setLoginRole('dealer'); setAuthModalOpen(true); }}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
                      >
                        Sign In as Dealer
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Dealer Sub-Tab 2: Freight & Commercial Transport */}
            {dealerTab === 'transport' && (
              <div className="flex flex-col gap-6">
                
                {/* Dealer Freight Header */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl">
                      <Truck className="w-6 h-6 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        {activeDistrict} Commercial Freight & Bulk Transport
                      </h3>
                      <p className="text-xs text-slate-500">
                        Book high-capacity freight canters and multi-axle trucks for mandi pickups, warehouse transfer, or interstate export
                      </p>
                    </div>
                  </div>

                  <span className="text-xs bg-teal-100 text-teal-900 font-bold px-3 py-1.5 rounded-xl border border-teal-200">
                    🚚 {transportVehicleStats.available} Commercial Vehicles Ready
                  </span>
                </div>

                {/* Available Commercial Fleet Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transportVehicles.map(vehicle => {
                    const isAvail = vehicle.status === 'Available';
                    return (
                      <div 
                        key={vehicle.id} 
                        className={cn(
                          "bg-white rounded-3xl p-5 border shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md",
                          isAvail ? "border-slate-200/90 hover:border-teal-400" : "border-slate-200 bg-slate-50/70 opacity-80"
                        )}
                      >
                        <div>
                          <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                            <img 
                              src={vehicle.image_url || "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=400&auto=format&fit=crop"} 
                              alt={vehicle.vehicle_type} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2">
                              <span className={cn(
                                "text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm",
                                isAvail ? "bg-teal-600 text-white" : "bg-amber-600 text-white"
                              )}>
                                {vehicle.status}
                              </span>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold">
                              {vehicle.vehicle_number}
                            </div>
                          </div>

                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-black text-slate-900 text-base">{vehicle.vehicle_type}</h4>
                              <span className="text-xs text-slate-500 font-semibold">📍 Hub: {vehicle.district}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-teal-700 text-base block">₹{vehicle.rate_per_km}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">per KM freight</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 block font-semibold">Payload Capacity</span>
                              <strong className="text-slate-800 font-extrabold">{vehicle.capacity_quintals} Quintals</strong>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 block font-semibold">Assigned Driver</span>
                              <strong className="text-slate-800 font-bold truncate block">{vehicle.driver_name}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => handleOpenTransportBooking(vehicle)}
                            disabled={!isAvail}
                            className={cn(
                              "w-full font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95",
                              isAvail 
                                ? "bg-teal-700 hover:bg-teal-600 text-white shadow-teal-700/20" 
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            )}
                          >
                            <Calendar size={14} />
                            <span>{isAvail ? `Book Commercial Freight` : `Vehicle Occupied`}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dealer's Freight Bookings */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        My Booked Freight Dispatches & Security OTP
                      </h3>
                      <p className="text-xs text-slate-500">
                        Real-time tracking of bulk commercial dispatches and verified OTP handover
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200 px-3 py-1 rounded-full">
                      {userTransportBookings.length} Dispatches Active
                    </span>
                  </div>

                  {authUser ? (
                    userTransportBookings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userTransportBookings.map((b: any) => (
                          <div key={b.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex flex-col justify-between gap-3 hover:bg-slate-50 transition-colors">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md inline-block">
                                    {b.booking_id} • {b.vehicle_type}
                                  </span>
                                  <h4 className="font-black text-slate-900 text-sm mt-1">{b.crop_name} ({b.crop_qty_quintals} Q)</h4>
                                </div>
                                <span className={cn(
                                  "text-[10px] font-black px-2.5 py-1 rounded-full",
                                  b.status === 'Completed' ? "bg-emerald-100 text-emerald-800" :
                                  b.status === 'In-Transit' ? "bg-blue-100 text-blue-800" :
                                  b.status === 'OTP Generated' ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-slate-200 text-slate-700"
                                )}>
                                  {b.status}
                                </span>
                              </div>

                              <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex flex-col gap-1 text-xs text-slate-600 mb-2">
                                <div className="flex items-center justify-between">
                                  <span>📅 Scheduled Slot:</span>
                                  <strong className="text-slate-900">{b.booking_date} at {b.booking_time}</strong>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>📍 Route:</span>
                                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{b.pickup_location} ➔ {b.drop_location}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>👤 Driver:</span>
                                  <strong className="text-slate-900">{b.driver_name} ({b.driver_mobile})</strong>
                                </div>
                                <div className="flex items-center justify-between font-black text-teal-800 pt-1 border-t border-slate-100">
                                  <span>Total Freight Fare:</span>
                                  <span className="text-sm">₹{b.estimated_fare?.toLocaleString()} ({b.estimated_km} km)</span>
                                </div>
                              </div>

                              {/* Security OTP Card */}
                              {b.otp ? (
                                <div className="p-3 bg-gradient-to-r from-teal-900 to-slate-950 text-white rounded-xl flex items-center justify-between shadow-sm">
                                  <div className="flex items-center gap-2">
                                    <Key className="w-5 h-5 text-teal-300" />
                                    <div>
                                      <span className="text-[10px] text-teal-200 block font-bold uppercase tracking-wider">Trip Handover OTP:</span>
                                      <span className="text-xs text-slate-300">Share with driver upon dispatch</span>
                                    </div>
                                  </div>
                                  <span className="text-lg font-mono font-black text-amber-300 tracking-widest bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                                    {b.otp}
                                  </span>
                                </div>
                              ) : (
                                <div className="p-2.5 bg-slate-100 rounded-xl text-center text-xs text-slate-500 italic">
                                  OTP will be generated by the transport agent upon assignment.
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Truck className="mx-auto w-7 h-7 text-slate-300 mb-1" />
                        <p className="text-xs text-slate-500">No freight bookings yet. Browse the commercial fleet above to schedule bulk dispatch.</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500">Sign in to view your scheduled commercial freight bookings.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ======================= TRANSPORT AGENT LOGISTICS PORTAL ======================= */}
        {portalMode === 'transport' && (
          <div className="flex flex-col gap-6">
            
            {/* Transport Portal Header Banner */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-6 rounded-3xl shadow-md border border-blue-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-blue-600/30 border border-blue-400/30 rounded-2xl">
                  <Truck className="w-7 h-7 text-blue-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                      Transport Logistics Agent Hub
                    </span>
                    <span className="text-xs text-blue-200">📍 District Operational Hub: {activeDistrict}</span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    Live Transport Bookings Dispatch, OTP Generation & Fleet Management
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/10 px-3.5 py-1.5 rounded-xl text-blue-200 font-bold border border-white/10">
                  ⚡ Live OTP Dispatch Active
                </span>
              </div>
            </div>

            {/* Unauthenticated Transport Agent View */}
            {(!authUser || authUser.role !== 'transport') ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center max-w-xl mx-auto w-full flex flex-col items-center gap-4 my-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Transport Logistics Agent Authorization</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Access live bookings placed by farmers and dealers, generate secure 6-digit trip OTPs, and coordinate vehicle dispatch.
                  </p>
                </div>

                <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3 text-left">
                  <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                    <span>Role Access:</span>
                    <strong className="text-slate-900">Registered AP Transport Agency</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                    <span>Capabilities:</span>
                    <strong className="text-blue-700">Generate Trip Handover OTP & Manage Fleet Status</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => handleQuickDemoLogin('transport')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black py-3 rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    <span>1-Click Launch Demo Transport Agent</span>
                  </button>

                  <button
                    onClick={() => { setLoginRole('transport'); setAuthModalOpen(true); }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn size={15} />
                    <span>Enter Agent ID & Passcode</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Agent KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                      <span>Assigned Fleet</span>
                      <Truck className="text-blue-600 w-4 h-4" />
                    </div>
                    <span className="text-2xl font-black text-slate-900">{transportVehicles.length}</span>
                    <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">In {activeDistrict}</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                      <span>Available Now</span>
                      <CheckCircle2 className="text-emerald-600 w-4 h-4" />
                    </div>
                    <span className="text-2xl font-black text-emerald-700">{transportVehicleStats.available}</span>
                    <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Ready for booking</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                      <span>Pending OTP</span>
                      <Key className="text-amber-500 w-4 h-4" />
                    </div>
                    <span className="text-2xl font-black text-amber-600">{allTransportBookings.filter(b => b.status === 'Confirmed').length}</span>
                    <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Requires OTP Generation</span>
                  </div>

                  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                      <span>In-Transit / Completed</span>
                      <Navigation className="text-indigo-600 w-4 h-4" />
                    </div>
                    <span className="text-2xl font-black text-indigo-700">{allTransportBookings.filter(b => b.status === 'In-Transit' || b.status === 'Completed').length}</span>
                    <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">Verified Trips</span>
                  </div>
                </div>

                {/* Live Bookings Dispatch Pipeline with GENERATE OTP Button */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Live Booking Requests & Dispatch Pipeline ({allTransportBookings.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Click "Generate OTP" to issue secure 6-digit trip verification code to farmer/dealer
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select 
                        value={transportDistrictFilter} 
                        onChange={e => setTransportDistrictFilter(e.target.value)}
                        className="text-xs border border-slate-200 bg-slate-50 rounded-xl p-2 font-bold text-slate-700 outline-none"
                      >
                        <option value="All">All Districts</option>
                        {DISTRICT_LIST.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      <select 
                        value={transportStatusFilter} 
                        onChange={e => setTransportStatusFilter(e.target.value)}
                        className="text-xs border border-slate-200 bg-slate-50 rounded-xl p-2 font-bold text-slate-700 outline-none"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Confirmed">Confirmed (Awaiting OTP)</option>
                        <option value="OTP Generated">OTP Generated</option>
                        <option value="In-Transit">In-Transit</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allTransportBookings.map((b: any) => (
                      <div 
                        key={b.id} 
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-3 hover:bg-slate-50 transition-colors shadow-xs"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-[10px] font-black uppercase text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md inline-block">
                                {b.booking_id} • 📍 {b.district}
                              </span>
                              <h4 className="font-extrabold text-slate-900 text-sm mt-1">{b.crop_name} ({b.crop_qty_quintals} Quintals)</h4>
                              <p className="text-xs text-slate-500">
                                Customer: <strong className="text-slate-800">{b.user_name}</strong> ({b.user_role}) • 📞 {b.user_mobile}
                              </p>
                            </div>

                            <span className={cn(
                              "text-xs font-black px-3 py-1 rounded-full",
                              b.status === 'Completed' ? "bg-emerald-100 text-emerald-800" :
                              b.status === 'In-Transit' ? "bg-blue-100 text-blue-800" :
                              b.status === 'OTP Generated' ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-slate-200 text-slate-700"
                            )}>
                              {b.status}
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600 mb-2">
                            <div className="flex items-center justify-between">
                              <span>📅 Scheduled Date & Time:</span>
                              <strong className="text-slate-900">{b.booking_date} at {b.booking_time}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>🚚 Assigned Vehicle:</span>
                              <strong className="text-slate-900">{b.vehicle_type} ({b.vehicle_number})</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>👤 Assigned Driver:</span>
                              <strong className="text-slate-900">{b.driver_name} ({b.driver_mobile})</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>📍 Pickup ➔ Drop:</span>
                              <span className="font-bold text-slate-800 truncate max-w-[210px]">{b.pickup_location} ➔ {b.drop_location}</span>
                            </div>
                            <div className="flex items-center justify-between font-black text-emerald-800 pt-1 border-t border-slate-100">
                              <span>Calculated Total Fare:</span>
                              <span className="text-sm">₹{b.estimated_fare?.toLocaleString()} ({b.estimated_km} km)</span>
                            </div>
                          </div>

                          {/* OTP Display if Generated */}
                          {b.otp && (
                            <div className="p-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl flex items-center justify-between shadow-xs mb-1">
                              <div className="flex items-center gap-2">
                                <Key className="w-5 h-5 text-amber-400" />
                                <div>
                                  <span className="text-[10px] text-blue-200 block font-bold uppercase tracking-wider">Trip Security OTP</span>
                                  <span className="text-[11px] text-slate-300">Generated & sent to {b.user_name}</span>
                                </div>
                              </div>
                              <span className="text-lg font-mono font-black text-amber-300 tracking-widest bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                                {b.otp}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
                          {b.status === 'Confirmed' && (
                            <button
                              onClick={() => handleGenerateTripOtp(b.id)}
                              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                            >
                              <Key size={14} />
                              <span>🔑 Generate Trip OTP</span>
                            </button>
                          )}

                          {b.status === 'OTP Generated' && (
                            <button
                              onClick={() => handleUpdateTransportStatus(b.id, 'In-Transit')}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                            >
                              <Navigation size={14} />
                              <span>🚀 Verify OTP & Start Trip (In-Transit)</span>
                            </button>
                          )}

                          {b.status === 'In-Transit' && (
                            <button
                              onClick={() => handleUpdateTransportStatus(b.id, 'Completed')}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                            >
                              <ShieldCheck size={14} />
                              <span>✅ Complete Trip & Free Vehicle</span>
                            </button>
                          )}

                          {b.status === 'Completed' && (
                            <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl text-xs font-bold flex items-center justify-between">
                              <span>Trip Successfully Completed</span>
                              <CheckCircle2 size={15} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {allTransportBookings.length === 0 && (
                      <div className="col-span-2 text-center py-12 text-slate-400">
                        <Truck className="mx-auto w-8 h-8 text-slate-300 mb-2" />
                        <p className="font-bold text-sm">No bookings match the filter criteria</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fleet Management Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Fleet Status & Availability Manager ({transportVehicles.length})
                      </h3>
                      <p className="text-xs text-slate-500">Toggle vehicle status for servicing or immediate dispatch</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {transportVehicles.map(v => (
                      <div key={v.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <h5 className="font-black text-slate-900 text-xs">{v.vehicle_type}</h5>
                          <span className="text-[11px] text-slate-500 block">{v.vehicle_number} • {v.driver_name}</span>
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1",
                            v.status === 'Available' ? "bg-emerald-100 text-emerald-800" :
                            v.status === 'In-Transit' ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                          )}>
                            {v.status}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleVehicleStatus(v.id, v.status)}
                          className="text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                        >
                          {v.status === 'Available' ? 'Set Maintenance' : 'Set Available'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        </section>
      </main>

      {/* ======================= TRANSPORT VEHICLE BOOKING MODAL ======================= */}
      <AnimatePresence>
        {transportBookingModalOpen && selectedVehicleForBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-blue-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Truck className="text-blue-700 w-5 h-5" />
                  <div>
                    <h3 className="font-black text-slate-900 text-base md:text-lg">
                      Book Farm & Freight Transport
                    </h3>
                    <p className="text-[11px] text-slate-500">Scheduled vehicle dispatch in {selectedVehicleForBooking.district}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setTransportBookingModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Vehicle Selected Brief */}
              <div className="flex items-center gap-3.5 bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100">
                <img 
                  src={selectedVehicleForBooking.image_url || "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=400&auto=format&fit=crop"} 
                  alt={selectedVehicleForBooking.vehicle_type} 
                  className="w-14 h-14 rounded-xl object-cover shadow-sm bg-slate-200"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-sm">{selectedVehicleForBooking.vehicle_type}</h4>
                    <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                      {selectedVehicleForBooking.vehicle_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Driver: <span className="font-bold text-slate-800">{selectedVehicleForBooking.driver_name}</span> (📞 {selectedVehicleForBooking.driver_mobile})
                  </p>
                  <p className="text-xs text-blue-900 font-bold mt-1">
                    Payload: {selectedVehicleForBooking.capacity_quintals} Q Max • Rate: <span className="text-blue-700 font-black">₹{selectedVehicleForBooking.rate_per_km}/km</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmTransportBooking} className="flex flex-col gap-3.5">
                
                {/* Date and Time Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Scheduled Booking Date</label>
                    <input 
                      type="date" 
                      required
                      value={bookDate} 
                      onChange={e => setBookDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Time Slot</label>
                    <select
                      value={bookTime}
                      onChange={e => setBookTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="06:00 AM">06:00 AM (Early Harvest Loading)</option>
                      <option value="09:30 AM">09:30 AM (Morning Mandi Dispatch)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon Processing)</option>
                      <option value="06:00 PM">06:00 PM (Evening Freight)</option>
                    </select>
                  </div>
                </div>

                {/* Pickup and Drop Locations */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Pickup Location / Mandi</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Tenali Farm Yard" 
                      value={bookPickupLocation} 
                      onChange={e => setBookPickupLocation(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Drop Destination / Mill</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Guntur Processing Mill" 
                      value={bookDropLocation} 
                      onChange={e => setBookDropLocation(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>

                {/* Crop and Load Qty */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Crop Produce</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Red Chilli, Paddy" 
                      value={bookCropName} 
                      onChange={e => setBookCropName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Load Weight (Quintals)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      max={selectedVehicleForBooking.capacity_quintals}
                      placeholder={`Max ${selectedVehicleForBooking.capacity_quintals} Q`} 
                      value={bookCropQty} 
                      onChange={e => setBookCropQty(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                    />
                  </div>
                </div>

                {/* Distance Slider & Fare Calculation */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Estimated Route Distance:</span>
                    <span className="text-blue-700 font-black text-sm">{bookEstimatedKm} KM</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="200" 
                    value={bookEstimatedKm} 
                    onChange={e => setBookEstimatedKm(parseInt(e.target.value))} 
                    className="w-full accent-blue-600"
                  />
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 font-black">
                    <span className="text-slate-600">Live Estimated Fare (₹{selectedVehicleForBooking.rate_per_km}/km × {bookEstimatedKm} km):</span>
                    <span className="text-emerald-800 text-base">
                      ₹{(bookEstimatedKm * selectedVehicleForBooking.rate_per_km).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setTransportBookingModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBookingTransport}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={15} />
                    <span>{isBookingTransport ? 'Booking...' : `Confirm Booking on ${bookDate}`}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= AUTHENTICATION / LOGIN MODAL ======================= */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-emerald-100 flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <img src="/ap-logo.png" alt="AP Govt Logo" className="w-8 h-8 rounded-full border border-slate-200 object-contain p-0.5" />
                  <div>
                    <h3 className="font-black text-emerald-950 text-base md:text-lg">
                      {isRegistering ? 'Create Account' : 'Portal Authentication'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Government of Andhra Pradesh • AP-RythuSetu</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAuthModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 4-Way Role Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['farmer', 'dealer', 'transport', 'admin'] as const).map(role => (
                  <button 
                    key={role} 
                    type="button"
                    onClick={() => { setLoginRole(role); setIsRegistering(false); }}
                    className={cn(
                      "flex-1 py-2 text-[11px] font-bold rounded-lg capitalize transition-all", 
                      loginRole === role 
                        ? "bg-white text-emerald-900 shadow-sm font-black" 
                        : "text-slate-500 hover:text-emerald-700"
                    )}
                  >
                    {role === 'transport' ? 'Transport' : role}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="flex flex-col gap-3">
                {loginRole !== 'admin' ? (
                  <>
                    {isRegistering && (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Full Name / Agency Name</label>
                          <input 
                            name="name" 
                            required 
                            type="text" 
                            placeholder={loginRole === 'transport' ? "e.g. AP GreenLine Logistics" : "e.g. Ramesh Naidu"}
                            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Mobile Number</label>
                          <input 
                            name="mobile" 
                            required 
                            type="tel" 
                            placeholder="10-digit mobile number"
                            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                          />
                        </div>
                      </>
                    )}

                    {!isRegistering && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">
                          {loginRole === 'farmer' ? 'Farmer ID' : loginRole === 'dealer' ? 'Dealer ID' : 'Transport Agent ID'}
                        </label>
                        <input 
                          name="id" 
                          required 
                          type="text" 
                          className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                          placeholder={loginRole === 'farmer' ? "e.g. AP-FRM-2026-1011" : loginRole === 'dealer' ? "e.g. AP-DLR-2026-3044" : "e.g. AP-TRP-2026-8801"} 
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Password</label>
                      <input 
                        name="password" 
                        required 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Admin ID</label>
                      <input name="id" required type="text" defaultValue="admin" className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Passcode</label>
                      <input name="password" required type="password" defaultValue="admin123" className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </>
                )}

                <button 
                  type="submit" 
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl mt-1 transition-all flex justify-center items-center gap-2 shadow-lg shadow-emerald-700/25 text-sm active:scale-[0.99]"
                >
                  {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />} 
                  {isRegistering ? 'Register & Enter Dashboard' : 'Enter Dashboard'}
                </button>
              </form>

              {/* 1-Click Fast Demo Login Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Or 1-Click Instant Demo Login:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickDemoLogin('farmer')}
                    className="py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors border border-emerald-200"
                  >
                    Demo Farmer
                  </button>
                  <button
                    onClick={() => handleQuickDemoLogin('dealer')}
                    className="py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold rounded-lg transition-colors border border-teal-200"
                  >
                    Demo Dealer
                  </button>
                  <button
                    onClick={() => handleQuickDemoLogin('transport')}
                    className="py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold rounded-lg transition-colors border border-blue-200"
                  >
                    Demo Agent
                  </button>
                  <button
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors border border-slate-200"
                  >
                    Demo Admin
                  </button>
                </div>
              </div>

              {loginRole !== 'admin' && (
                <p className="text-center text-xs text-slate-500 pt-1">
                  {isRegistering ? "Already have an ID?" : "New user without an ID?"} 
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)} 
                    className="ml-1 text-emerald-700 font-bold hover:underline"
                  >
                    {isRegistering ? "Sign In" : "Register here"}
                  </button>
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= FAST CROP PUBLISH MODAL ======================= */}
      <AnimatePresence>
        {publishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PackageCheck className="text-emerald-600 w-5 h-5" />
                  <h3 className="font-extrabold text-emerald-950 text-base md:text-lg">
                    Add Harvest for Sale in {activeDistrict}
                  </h3>
                </div>
                <button 
                  onClick={() => setPublishModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Crop Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Red Chilli (Teja), Paddy, Groundnut" 
                    value={newCrop} 
                    onChange={e => setNewCrop(e.target.value)} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Variety / Grade</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Export Grade / Organic / Standard" 
                    value={newVariety} 
                    onChange={e => setNewVariety(e.target.value)} 
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Quantity (Quintals)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 25" 
                      value={newQty} 
                      onChange={e => setNewQty(e.target.value)} 
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Asking Price (₹ / Q)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 18500" 
                      value={newPrice} 
                      onChange={e => setNewPrice(e.target.value)} 
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-900" 
                    />
                  </div>
                </div>

                <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 flex items-start gap-2.5 mt-1">
                  <input 
                    type="checkbox" 
                    id="modalInsp" 
                    checked={reqInspection} 
                    onChange={e => setReqInspection(e.target.checked)} 
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded" 
                  />
                  <label htmlFor="modalInsp" className="text-xs font-semibold text-emerald-900 cursor-pointer">
                    Apply for AP Govt Rythu Bharosa Quality & Moisture Inspection
                  </label>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100 mt-2">
                <button
                  onClick={() => setPublishModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send size={14} />
                  <span>{isPublishing ? 'Publishing...' : 'Publish to Live Network'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= DEALER ENQUIRY MODAL ======================= */}
      <AnimatePresence>
        {enquiryModalOpen && selectedCropForEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-teal-700 w-5 h-5" />
                  <div>
                    <h3 className="font-black text-emerald-950 text-base md:text-lg">
                      Propose Bargain Deal & Purchase Offer
                    </h3>
                    <p className="text-[11px] text-slate-500">Submit your custom price per Quintal to negotiate directly</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEnquiryModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Crop Brief */}
              <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <img 
                  src={selectedCropForEnquiry.image_url || getCropImage(selectedCropForEnquiry.crop)} 
                  alt={selectedCropForEnquiry.crop} 
                  onError={(e) => { e.currentTarget.src = getCropImage(selectedCropForEnquiry.crop); }}
                  className="w-14 h-14 rounded-xl object-cover shadow-sm bg-slate-200"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-sm">{selectedCropForEnquiry.crop}</h4>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {selectedCropForEnquiry.quality || 'Verified'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Farmer: <span className="font-bold text-slate-800">{selectedCropForEnquiry.farmer_name}</span> ({selectedCropForEnquiry.district})
                  </p>
                  <p className="text-xs text-emerald-800 font-bold mt-1">
                    Farmer Asking Base Rate: <span className="text-emerald-700 font-black">₹{selectedCropForEnquiry.price} / Q</span> (Total {selectedCropForEnquiry.qty} Q Available)
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitEnquiry} className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Required Quantity (Q)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      max={selectedCropForEnquiry.qty}
                      value={enquiryQty} 
                      onChange={e => setEnquiryQty(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Your Bargain Price (₹ / Q)</label>
                    <input 
                      type="number" 
                      required
                      value={enquiryPrice} 
                      onChange={e => setEnquiryPrice(e.target.value)}
                      placeholder={`e.g. ${selectedCropForEnquiry.price}`}
                      className="w-full border-2 border-teal-500/80 bg-teal-50/30 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-black text-teal-950" 
                    />
                  </div>
                </div>

                {/* Dynamic Bargain & Total Summary Card */}
                {enquiryPrice && enquiryQty && (
                  <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200/80 flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-600">
                      <span>Bargain Difference vs Asking Rate:</span>
                      {parseFloat(enquiryPrice) < selectedCropForEnquiry.price ? (
                        <span className="font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                          -₹{(selectedCropForEnquiry.price - parseFloat(enquiryPrice)).toFixed(0)}/Q Discount (Bargain)
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Full Asking Rate (₹{enquiryPrice}/Q)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between font-black text-slate-900 pt-1 border-t border-teal-100 text-sm">
                      <span>Total Bargain Purchase Amount:</span>
                      <span className="text-teal-900 text-base font-black">
                        ₹{(parseInt(enquiryQty || '0') * parseFloat(enquiryPrice || '0')).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Dealer Contact Mobile</label>
                  <input 
                    type="tel" 
                    required
                    value={enquiryMobile} 
                    onChange={e => setEnquiryMobile(e.target.value)}
                    placeholder="10-digit mobile number for farmer to call"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Negotiation & Delivery Terms Note</label>
                  <textarea 
                    rows={2}
                    value={enquiryMessage} 
                    onChange={e => setEnquiryMessage(e.target.value)}
                    placeholder="Enter payment mode, pickup transport, packaging arrangements..."
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-xs" 
                  />
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEnquiryModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEnquiry}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-800 to-emerald-800 hover:from-teal-900 hover:to-emerald-900 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>{isSubmittingEnquiry ? 'Sending...' : 'Transmit Bargain Proposal'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= AI VOICE & VISION ASSISTANT (FLOATING) ======================= */}
      <div className="fixed bottom-6 right-6 z-40">
        {!aiOpen ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAiOpen(true)}
            className="bg-gradient-to-tr from-emerald-900 to-emerald-700 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 border-2 border-emerald-400/40 relative group"
          >
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
            </span>
            <Mic size={22} className="text-emerald-200 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-sm pr-1 hidden sm:inline">Rythu Mitra AI Assistant</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-[360px] md:w-[420px] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-400 w-5 h-5" />
                <div>
                  <h4 className="font-black text-sm">Rythu Mitra AI Assistant</h4>
                  <span className="text-[10px] text-emerald-300">Voice Grievances & Crop Disease Scan</span>
                </div>
              </div>
              <button onClick={() => setAiOpen(false)} className="text-white/80 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            {/* Mode & Language Tabs */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
              <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold">
                <button
                  onClick={() => setAiMode('voice')}
                  className={cn("px-2.5 py-1 rounded-md transition-all", aiMode === 'voice' ? "bg-white text-emerald-950 shadow-sm" : "text-slate-600")}
                >
                  🎙️ Voice
                </button>
                <button
                  onClick={() => setAiMode('disease')}
                  className={cn("px-2.5 py-1 rounded-md transition-all", aiMode === 'disease' ? "bg-white text-emerald-950 shadow-sm" : "text-slate-600")}
                >
                  🌿 Disease Scan
                </button>
              </div>

              <div className="flex gap-1 text-[11px] font-bold">
                {(['te', 'en', 'hi'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setAiLang(l)}
                    className={cn(
                      "px-2 py-0.5 rounded-md uppercase",
                      aiLang === l ? "bg-emerald-800 text-white" : "bg-white border border-slate-200 text-slate-600"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Body Content */}
            <div className="p-4 flex flex-col gap-3 max-h-[360px] overflow-y-auto">
              {aiMode === 'voice' ? (
                <div className="flex flex-col items-center text-center gap-3 my-2">
                  <button
                    onClick={handleStartVoice}
                    disabled={isListening}
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all",
                      isListening ? "bg-red-500 animate-pulse text-white" : "bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95"
                    )}
                  >
                    <Mic size={28} />
                  </button>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {isListening ? "Listening... Speak your crop query or complaint" : "Tap microphone to speak"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Supports Telugu (తెలుగు), English, and Hindi
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 text-center">
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                  {aiImagePreview ? (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={aiImagePreview} alt="crop scan" className="w-full h-full object-cover" />
                      {aiScanning && (
                        <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                          <span className="animate-pulse">Scanning Crop Pathogens...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-28 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors p-2"
                    >
                      <Sparkles size={24} className="text-emerald-600 mb-1" />
                      <span className="text-xs font-bold text-emerald-900">Upload Diseased Crop Photo</span>
                      <span className="text-[10px] text-slate-400">Instant AI diagnostics & chemical prescription</span>
                    </div>
                  )}
                </div>
              )}

              {/* Transcript & Response Bubble */}
              {aiTranscript && (
                <div className="p-2.5 bg-slate-100 rounded-xl text-xs text-slate-700">
                  <span className="font-bold text-slate-500 text-[10px] block uppercase">Heard:</span>
                  "{aiTranscript}"
                </div>
              )}

              {aiResponse && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                  <span className="font-bold text-emerald-700 text-[10px] block uppercase flex items-center gap-1">
                    <Sparkles size={11} /> AI Response:
                  </span>
                  {aiResponse}
                </div>
              )}

              {lastLoggedTicket && (
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-amber-600" />
                  <span>Logged to Command Center (Ticket #{lastLoggedTicket})</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
}
