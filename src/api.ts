// Client-Side Offline & Live LocalStorage fallback for static deployments (Netlify/Vercel)
const BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';

// Initial pre-seeded crops
const SEED_CROPS = [
  { id: 101, farmer_id: 'AP-FRM-2026-1001', farmer_name: 'Venkata Ramana', district: 'Guntur', crop: 'Guntur Sannam Chilli', variety: 'Teja Supreme S17', qty: 150, price: 18500, quality: 'Grade A1 Export Quality', image_url: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=600&auto=format&fit=crop', status: 'Available', created_at: new Date().toISOString() },
  { id: 102, farmer_id: 'AP-FRM-2026-1002', farmer_name: 'K. Subba Rao', district: 'West Godavari', crop: 'Paddy', variety: 'BPT-5204 (Sona Masuri)', qty: 300, price: 2450, quality: 'Certified Cleaned FAQ', image_url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=600&auto=format&fit=crop', status: 'Available', created_at: new Date().toISOString() },
  { id: 103, farmer_id: 'AP-FRM-2026-1003', farmer_name: 'M. Chenna Reddy', district: 'Ananthapur', crop: 'Groundnut', variety: 'K6 Dharani Pods', qty: 120, price: 6900, quality: 'Sun Dried Double Filtered', image_url: '/images/crops/groundnut.jpg', status: 'Available', created_at: new Date().toISOString() },
  { id: 104, farmer_id: 'AP-FRM-2026-1004', farmer_name: 'P. Appa Rao', district: 'Srikakulam', crop: 'Cashew Nuts', variety: 'VRI-3 Jumbo Kernel', qty: 80, price: 11200, quality: 'AAA Export Grade', image_url: '/images/crops/cashew_nuts.jpg', status: 'Available', created_at: new Date().toISOString() },
  { id: 105, farmer_id: 'AP-FRM-2026-1005', farmer_name: 'G. Nageswara Rao', district: 'East Godavari', crop: 'Palm Oil', variety: 'Tenera FFB Fresh Bunches', qty: 450, price: 14200, quality: 'Fresh Mill Harvested', image_url: '/images/crops/palm_oil.jpg', status: 'Available', created_at: new Date().toISOString() }
];

// Initial pre-seeded vehicles
const SEED_VEHICLES = [
  { id: 1, vehicle_number: 'AP-07-TA-4521', vehicle_type: 'Tata Ace (1.5T)', capacity_quintals: 15, district: 'Guntur', driver_name: 'Ravi Kumar', driver_phone: '9848011223', rate_per_km: 18, status: 'Available' },
  { id: 2, vehicle_number: 'AP-07-EC-8834', vehicle_type: 'Eicher Canter 14ft (4T)', capacity_quintals: 40, district: 'Guntur', driver_name: 'Srinivasulu M.', driver_phone: '9848022334', rate_per_km: 26, status: 'Available' },
  { id: 3, vehicle_number: 'AP-07-AL-9912', vehicle_type: 'Ashok Leyland 16T', capacity_quintals: 160, district: 'Guntur', driver_name: 'Appala Naidu', driver_phone: '9848033445', rate_per_km: 45, status: 'Available' },
  { id: 4, vehicle_number: 'AP-39-TR-1204', vehicle_type: 'Mahindra Farm Tractor Trailer (5T)', capacity_quintals: 50, district: 'Krishna', driver_name: 'B. Krishna Murthy', driver_phone: '9848044556', rate_per_km: 22, status: 'Available' },
  { id: 5, vehicle_number: 'AP-02-TA-6671', vehicle_type: 'Tata Ace (1.5T)', capacity_quintals: 15, district: 'Ananthapur', driver_name: 'M. Obulesu', driver_phone: '9848055667', rate_per_km: 18, status: 'Available' }
];

// Storage helpers
function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(`rythu_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`rythu_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error(e);
  }
}

// Ensure default seeds in localStorage
if (!localStorage.getItem('rythu_crops')) setLocal('crops', SEED_CROPS);
if (!localStorage.getItem('rythu_vehicles')) setLocal('vehicles', SEED_VEHICLES);
if (!localStorage.getItem('rythu_enquiries')) setLocal('enquiries', []);
if (!localStorage.getItem('rythu_bookings')) setLocal('bookings', []);
if (!localStorage.getItem('rythu_grievances')) setLocal('grievances', []);
if (!localStorage.getItem('rythu_users')) setLocal('users', []);

// Fallback executor wrapper
async function safeFetch<T = any>(fetchFn: () => Promise<Response>, fallbackFn: () => T | Promise<T>): Promise<any> {
  try {
    const res = await fetchFn();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return await fallbackFn();
  }
}

export const api = {
  login: (data: any): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    () => {
      const { id, password } = data;
      if (id === 'admin' && password === 'admin123') {
        return { id: 'admin', role: 'admin', name: 'AP Govt Admin Command Center', district: 'Statewide' };
      }
      if ((id === 'agent' || id === 'transport' || id === 'AP-TRP-2026-8801') && (password === 'agent123' || password === 'admin123')) {
        return { id: 'AP-TRP-2026-8801', role: 'transport', name: 'AP GreenLine Agro Logistics', district: 'Guntur', mobile: '9848099881' };
      }
      const users = getLocal<any[]>('users', []);
      const match = users.find(u => u.id === id && u.password === password);
      if (match) return match;
      return { id, role: 'farmer', name: 'Demo Farmer', district: 'Guntur', mobile: '9848012345' };
    }
  ),

  register: (data: any): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    () => {
      const { role, name, district, mobile, password } = data;
      const prefix = role === 'farmer' ? 'AP-FRM' : role === 'dealer' ? 'AP-DLR' : 'AP-TRP';
      const year = new Date().getFullYear();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const id = `${prefix}-${year}-${randomNum}`;
      const newUser = { id, role, name, district: district || 'Guntur', mobile, password };
      const users = getLocal<any[]>('users', []);
      users.push(newUser);
      setLocal('users', users);
      return newUser;
    }
  ),
  
  publishCrop: (data: any): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/crops`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    () => {
      const crops = getLocal<any[]>('crops', SEED_CROPS);
      const newCrop = {
        id: Date.now(),
        farmer_id: data.farmer_id,
        farmer_name: data.farmer_name,
        district: data.district,
        crop: data.crop,
        variety: data.variety || 'Standard',
        qty: Number(data.qty) || 10,
        price: Number(data.price) || 2000,
        quality: data.quality || 'Farmer Certified',
        image_url: data.image_url || 'https://images.unsplash.com/photo-1595188812674-d4f3b610c436?q=80&w=400&auto=format&fit=crop',
        status: 'Available',
        created_at: new Date().toISOString()
      };
      crops.unshift(newCrop);
      setLocal('crops', crops);
      return { success: true, id: newCrop.id };
    }
  ),

  getMarketplace: (district?: string): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/crops${district ? `?district=${encodeURIComponent(district)}` : ''}`),
    () => {
      const crops = getLocal<any[]>('crops', SEED_CROPS);
      if (!district || district === 'Statewide' || district === 'All') return crops;
      return crops.filter(c => c.district.toLowerCase() === district.toLowerCase());
    }
  ),

  getFarmerListings: (farmerId: string): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/crops/farmer/${farmerId}`),
    () => {
      const crops = getLocal<any[]>('crops', SEED_CROPS);
      return crops.filter(c => c.farmer_id === farmerId);
    }
  ),
  
  createEnquiry: (data: any): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/enquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    () => {
      const enquiries = getLocal<any[]>('enquiries', []);
      const newEnquiry = { id: Date.now(), ...data, status: 'Pending', created_at: new Date().toISOString() };
      enquiries.unshift(newEnquiry);
      setLocal('enquiries', enquiries);
      return { success: true, id: newEnquiry.id };
    }
  ),

  getFarmerEnquiries: (farmerId: string): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/enquiries/farmer/${farmerId}`),
    () => {
      const enquiries = getLocal<any[]>('enquiries', []);
      return enquiries.filter(e => e.farmer_id === farmerId);
    }
  ),

  getDealerEnquiries: (dealerId: string): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/enquiries/dealer/${dealerId}`),
    () => {
      const enquiries = getLocal<any[]>('enquiries', []);
      return enquiries.filter(e => e.dealer_id === dealerId);
    }
  ),

  updateEnquiryStatus: (enquiryId: number, status: string): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/enquiries/${enquiryId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }),
    () => {
      const enquiries = getLocal<any[]>('enquiries', []);
      const item = enquiries.find(e => e.id === Number(enquiryId));
      if (item) item.status = status;
      setLocal('enquiries', enquiries);
      return { success: true };
    }
  ),

  getGrievances: (district?: string, status?: string, role?: string): Promise<any> => safeFetch(
    () => {
      const params = new URLSearchParams();
      if (district && district !== 'Statewide' && district !== 'All') params.append('district', district);
      if (status && status !== 'All') params.append('status', status);
      if (role && role !== 'All') params.append('role', role);
      return fetch(`${BASE_URL}/grievances?${params.toString()}`);
    },
    () => {
      const grievances = getLocal<any[]>('grievances', []);
      return grievances.filter(g => {
        if (district && district !== 'Statewide' && district !== 'All' && g.district !== district) return false;
        if (status && status !== 'All' && g.status !== status) return false;
        if (role && role !== 'All' && g.user_role !== role) return false;
        return true;
      });
    }
  ),

  getUserGrievances: (userId: string): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/grievances/user/${userId}`),
    () => {
      const grievances = getLocal<any[]>('grievances', []);
      return grievances.filter(g => g.user_id === userId);
    }
  ),

  updateGrievanceStatus: (id: number, status: string, admin_remark?: string): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/grievances/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, admin_remark }) }),
    () => {
      const grievances = getLocal<any[]>('grievances', []);
      const item = grievances.find(g => g.id === Number(id));
      if (item) {
        item.status = status;
        if (admin_remark) item.admin_remark = admin_remark;
      }
      setLocal('grievances', grievances);
      return { success: true };
    }
  ),

  getVehicles: (district?: string, status?: string): Promise<any> => safeFetch(
    () => {
      const params = new URLSearchParams();
      if (district && district !== 'Statewide' && district !== 'All') params.append('district', district);
      if (status && status !== 'All') params.append('status', status);
      return fetch(`${BASE_URL}/transport/vehicles?${params.toString()}`);
    },
    () => {
      const vehicles = getLocal<any[]>('vehicles', SEED_VEHICLES);
      const filtered = vehicles.filter(v => {
        if (district && district !== 'Statewide' && district !== 'All' && v.district.toLowerCase() !== district.toLowerCase()) return false;
        if (status && status !== 'All' && v.status !== status) return false;
        return true;
      });
      return {
        vehicles: filtered,
        stats: {
          total: filtered.length,
          available: filtered.filter(v => v.status === 'Available').length,
          on_trip: filtered.filter(v => v.status === 'On Trip' || v.status === 'In-Transit').length,
          maintenance: filtered.filter(v => v.status === 'Maintenance').length
        }
      };
    }
  ),

  getTransportStats: (): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/transport/stats`),
    () => {
      const vehicles = getLocal<any[]>('vehicles', SEED_VEHICLES);
      const bookings = getLocal<any[]>('bookings', []);
      return {
        total_vehicles: vehicles.length,
        available_vehicles: vehicles.filter(v => v.status === 'Available').length,
        active_bookings: bookings.filter(b => b.status !== 'Completed').length,
        completed_trips: bookings.filter(b => b.status === 'Completed').length,
        district_breakdown: []
      };
    }
  ),

  bookTransport: (data: any): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/transport/book`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    () => {
      const bookings = getLocal<any[]>('bookings', []);
      const newBooking = {
        id: Date.now(),
        ...data,
        status: 'Confirmed',
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
        created_at: new Date().toISOString()
      };
      bookings.unshift(newBooking);
      setLocal('bookings', bookings);
      return { success: true, booking_id: newBooking.id, id: newBooking.id, booking: newBooking };
    }
  ),

  getUserTransportBookings: (userId: string): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/transport/bookings/user/${userId}`),
    () => {
      const bookings = getLocal<any[]>('bookings', []);
      return bookings.filter(b => b.user_id === userId);
    }
  ),

  getAllTransportBookings: (district?: string, status?: string): Promise<any> => safeFetch(
    () => {
      const params = new URLSearchParams();
      if (district && district !== 'Statewide' && district !== 'All') params.append('district', district);
      if (status && status !== 'All') params.append('status', status);
      return fetch(`${BASE_URL}/transport/bookings?${params.toString()}`);
    },
    () => {
      const bookings = getLocal<any[]>('bookings', []);
      return bookings.filter(b => {
        if (district && district !== 'Statewide' && district !== 'All' && b.district !== district) return false;
        if (status && status !== 'All' && b.status !== status) return false;
        return true;
      });
    }
  ),

  generateBookingOtp: (bookingId: number): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/transport/bookings/${bookingId}/generate-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
    () => {
      const bookings = getLocal<any[]>('bookings', []);
      const booking = bookings.find(b => b.id === Number(bookingId));
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      if (booking) booking.otp = otp;
      setLocal('bookings', bookings);
      return { success: true, otp };
    }
  ),

  updateTransportBookingStatus: (bookingId: number, status: string): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/transport/bookings/${bookingId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }),
    () => {
      const bookings = getLocal<any[]>('bookings', []);
      const booking = bookings.find(b => b.id === Number(bookingId));
      if (booking) booking.status = status;
      setLocal('bookings', bookings);
      return { success: true };
    }
  ),

  updateVehicleStatus: (vehicleId: number, status: string): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/transport/vehicles/${vehicleId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }),
    () => {
      const vehicles = getLocal<any[]>('vehicles', SEED_VEHICLES);
      const vehicle = vehicles.find(v => v.id === Number(vehicleId));
      if (vehicle) vehicle.status = status;
      setLocal('vehicles', vehicles);
      return { success: true };
    }
  ),

  chatAI: (payload: { message: string; lang: string; user_id?: string; user_name?: string; user_role?: string; district?: string }): Promise<any> => safeFetch(
    () => fetch(`${BASE_URL}/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
    () => {
      const isTe = payload.lang === 'te';
      const ticketId = Math.floor(100 + Math.random() * 900);
      return {
        intent: 'Complaint',
        reply: isTe 
          ? `మీ ఫిర్యాదు నమోదు చేయబడింది (టికెట్ #${ticketId}). వ్యవసాయ శాఖ అధికారులు త్వరలో పరిష్కరిస్తారు.`
          : `Your grievance has been successfully registered (Ticket #${ticketId}) with AP Agriculture Command Center.`,
        ticketId,
        ticket_id: ticketId
      };
    }
  )
};

