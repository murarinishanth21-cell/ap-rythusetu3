const BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';

export const api = {
  login: (data: any) => fetch(`${BASE_URL}/login`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data) 
  }).then(r => r.json()),

  register: (data: any) => fetch(`${BASE_URL}/register`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data) 
  }).then(r => r.json()),
  
  publishCrop: (data: any) => fetch(`${BASE_URL}/crops`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(data) 
  }).then(r => r.json()),

  getMarketplace: (district?: string) => fetch(`${BASE_URL}/crops${district ? `?district=${encodeURIComponent(district)}` : ''}`).then(r => r.json()),

  getFarmerListings: (farmerId: string) => fetch(`${BASE_URL}/crops/farmer/${farmerId}`).then(r => r.json()),
  
  createEnquiry: (data: any) => fetch(`${BASE_URL}/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  getFarmerEnquiries: (farmerId: string) => fetch(`${BASE_URL}/enquiries/farmer/${farmerId}`).then(r => r.json()),

  getDealerEnquiries: (dealerId: string) => fetch(`${BASE_URL}/enquiries/dealer/${dealerId}`).then(r => r.json()),

  updateEnquiryStatus: (enquiryId: number, status: string) => fetch(`${BASE_URL}/enquiries/${enquiryId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).then(r => r.json()),

  // Grievances & Voice Complaints API
  getGrievances: (district?: string, status?: string, role?: string) => {
    const params = new URLSearchParams();
    if (district && district !== 'Statewide' && district !== 'All') params.append('district', district);
    if (status && status !== 'All') params.append('status', status);
    if (role && role !== 'All') params.append('role', role);
    const query = params.toString();
    return fetch(`${BASE_URL}/grievances${query ? `?${query}` : ''}`).then(r => r.json());
  },

  getUserGrievances: (userId: string) => fetch(`${BASE_URL}/grievances/user/${userId}`).then(r => r.json()),

  updateGrievanceStatus: (id: number, status: string, admin_remark?: string) => fetch(`${BASE_URL}/grievances/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, admin_remark })
  }).then(r => r.json()),

  // Transport & Logistics Fleet API
  getVehicles: (district?: string, status?: string) => {
    const params = new URLSearchParams();
    if (district && district !== 'Statewide' && district !== 'All') params.append('district', district);
    if (status && status !== 'All') params.append('status', status);
    const query = params.toString();
    return fetch(`${BASE_URL}/transport/vehicles${query ? `?${query}` : ''}`).then(r => r.json());
  },

  getTransportStats: () => fetch(`${BASE_URL}/transport/stats`).then(r => r.json()),

  bookTransport: (data: any) => fetch(`${BASE_URL}/transport/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  getUserTransportBookings: (userId: string) => fetch(`${BASE_URL}/transport/bookings/user/${userId}`).then(r => r.json()),

  getAllTransportBookings: (district?: string, status?: string) => {
    const params = new URLSearchParams();
    if (district && district !== 'Statewide' && district !== 'All') params.append('district', district);
    if (status && status !== 'All') params.append('status', status);
    const query = params.toString();
    return fetch(`${BASE_URL}/transport/bookings${query ? `?${query}` : ''}`).then(r => r.json());
  },

  generateBookingOtp: (bookingId: number) => fetch(`${BASE_URL}/transport/bookings/${bookingId}/generate-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }).then(r => r.json()),

  updateTransportBookingStatus: (bookingId: number, status: string) => fetch(`${BASE_URL}/transport/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).then(r => r.json()),

  updateVehicleStatus: (vehicleId: number, status: string) => fetch(`${BASE_URL}/transport/vehicles/${vehicleId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).then(r => r.json()),

  chatAI: (payload: { message: string; lang: string; user_id?: string; user_name?: string; user_role?: string; district?: string }) => 
    fetch(`${BASE_URL}/ai/chat`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    }).then(r => r.json())
};
