import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.js';

const sportCapacities = {
  BADMINTON: 4,
  PICKLEBALL: 4,
  BASKETBALL: 1,
  BILLIARDS: 2,
};

const sportsList = ['BADMINTON', 'PICKLEBALL', 'BASKETBALL', 'BILLIARDS'];

const timeOptions = [
  '08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM',
  '06:00 PM','07:00 PM','08:00 PM','09:00 PM','10:00 PM',
  '11:00 PM','12:00 AM','01:00 AM',
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'schedule' | 'rates'
  
  // Bookings Tab State
  const [bookingTab, setBookingTab] = useState('pending'); // 'pending' | 'confirmed'
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Schedule State
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleSport, setScheduleSport] = useState('BADMINTON');
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Rates State
  const [ratesConfig, setRatesConfig] = useState({
    BADMINTON: 300,
    PICKLEBALL: 300,
    BASKETBALL: 500,
    BILLIARDS: 200,
    primeRates: {
      BADMINTON: 350,
      PICKLEBALL: 350,
      BASKETBALL: 550,
      BILLIARDS: 250,
    },
    primeStartHour: 17,
    primeEndHour: 22
  });
  const [ratesSaving, setRatesSaving] = useState(false);

  // Confirm/Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('confirm'); // 'confirm' | 'edit'
  const [modalBooking, setModalBooking] = useState(null);
  
  const [modalEditTime, setModalEditTime] = useState('');
  const [modalEditHours, setModalEditHours] = useState('1 Hour');
  const [modalAssignedCourts, setModalAssignedCourts] = useState({}); 
  const [modalAvailableCourtsMap, setModalAvailableCourtsMap] = useState({}); 
  const [modalSaving, setModalSaving] = useState(false);

  // Fetch Bookings List
  const fetchBookingsList = async (status) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'bookings'), where('status', '==', status));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBookingsList(data);
    } catch (err) {
      console.error(`Error fetching ${status} bookings:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Confirmed Bookings for Schedule
  const fetchConfirmedBookings = async () => {
    setScheduleLoading(true);
    try {
      const q = query(
        collection(db, 'bookings'),
        where('status', '==', 'confirmed'),
        where('date', '==', scheduleDate),
        where('sport', '==', scheduleSport)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setConfirmedBookings(data);
    } catch (err) {
      console.error('Error fetching confirmed bookings:', err);
    } finally {
      setScheduleLoading(false);
    }
  };

  // Fetch Rates Configuration
  const fetchRatesConfig = async () => {
    try {
      const docRef = await getDoc(doc(db, 'settings', 'rates'));
      if (docRef.exists()) {
        const data = docRef.data();
        if (!data.primeRates) {
          data.primeRates = {
            BADMINTON: data.BADMINTON || 300,
            PICKLEBALL: data.PICKLEBALL || 300,
            BASKETBALL: data.BASKETBALL || 500,
            BILLIARDS: data.BILLIARDS || 200,
          };
        }
        setRatesConfig(data);
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookingsList(bookingTab);
    } else if (activeTab === 'schedule') {
      fetchConfirmedBookings();
    } else if (activeTab === 'rates') {
      fetchRatesConfig();
    }
  }, [activeTab, bookingTab, scheduleDate, scheduleSport]);

  const getCourtOptions = (sport) => {
    const max = sportCapacities[sport] || 4;
    return Array.from({ length: max }, (_, i) => `Court ${i + 1}`);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) return;
    try {
      await updateDoc(doc(db, 'bookings', id), { status: newStatus });
      setBookingsList(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
      alert(`Failed to update booking status.`);
    }
  };

  // ----------------------------------------------------
  // Modal Logic
  // ----------------------------------------------------
  const openConfirmModal = (booking, mode = 'confirm') => {
    setModalMode(mode);
    setModalBooking(booking);
    setModalEditTime(booking.time);
    setModalEditHours(booking.hours);
    
    const initialAssigned = {};
    if (booking.assignedCourts && Array.isArray(booking.assignedCourts)) {
       booking.assignedCourts.forEach(ac => {
         initialAssigned[ac.time] = ac.court;
       });
    } else if (booking.courtNumber) {
       // Legacy booking format
       const startIdx = timeOptions.indexOf(booking.time);
       const h = parseInt(booking.hours.split(' ')[0], 10) || 1;
       for (let i = 0; i < h; i++) {
         const t = timeOptions[startIdx + i];
         if (t) initialAssigned[t] = booking.courtNumber;
       }
    }
    setModalAssignedCourts(initialAssigned);
    setModalVisible(true);
  };

  const closeConfirmModal = () => {
    setModalVisible(false);
    setModalBooking(null);
  };

  useEffect(() => {
    if (!modalVisible || !modalBooking) return;

    const fetchModalAvailability = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('status', '==', 'confirmed'),
          where('date', '==', modalBooking.date),
          where('sport', '==', modalBooking.sport)
        );
        const snap = await getDocs(q);
        const otherConfirmed = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(b => b.id !== modalBooking.id); 

        const startIdx = timeOptions.indexOf(modalEditTime);
        const h = parseInt(modalEditHours.split(' ')[0], 10) || 1;
        
        const availabilityMap = {}; 
        const allCourts = getCourtOptions(modalBooking.sport);

        for (let i = 0; i < h; i++) {
          const t = timeOptions[startIdx + i];
          if (!t) continue;
          
          const takenCourts = new Set();
          otherConfirmed.forEach(b => {
             if (b.assignedCourts) {
               b.assignedCourts.forEach(ac => {
                 if (ac.time === t) takenCourts.add(ac.court);
               });
             } else if (b.courtNumber) {
               const bStartIdx = timeOptions.indexOf(b.time);
               const bH = parseInt(b.hours.split(' ')[0], 10) || 1;
               const checkIdx = timeOptions.indexOf(t);
               if (checkIdx >= bStartIdx && checkIdx < bStartIdx + bH) {
                 takenCourts.add(b.courtNumber);
               }
             }
          });

          availabilityMap[t] = allCourts.filter(c => !takenCourts.has(c));
        }
        
        setModalAvailableCourtsMap(availabilityMap);

        setModalAssignedCourts(prev => {
           const next = { ...prev };
           for (let i = 0; i < h; i++) {
             const t = timeOptions[startIdx + i];
             if (!t) continue;
             if (!next[t] || !availabilityMap[t].includes(next[t])) {
               next[t] = availabilityMap[t][0] || '';
             }
           }
           Object.keys(next).forEach(k => {
             const checkIdx = timeOptions.indexOf(k);
             if (checkIdx < startIdx || checkIdx >= startIdx + h) {
               delete next[k];
             }
           });
           return next;
        });

      } catch (err) {
        console.error('Error fetching modal availability:', err);
      }
    };

    fetchModalAvailability();
  }, [modalVisible, modalBooking, modalEditTime, modalEditHours]);

  const handleSaveModal = async () => {
    const startIdx = timeOptions.indexOf(modalEditTime);
    const h = parseInt(modalEditHours.split(' ')[0], 10) || 1;
    
    const newAssignedCourts = [];
    for (let i = 0; i < h; i++) {
      const t = timeOptions[startIdx + i];
      if (!t) {
        alert('Booking extends past closing time.');
        return;
      }
      const c = modalAssignedCourts[t];
      if (!c) {
        alert(`No court available for ${t}. Please adjust the time or courts.`);
        return;
      }
      newAssignedCourts.push({ time: t, court: c });
    }

    setModalSaving(true);
    try {
      await updateDoc(doc(db, 'bookings', modalBooking.id), {
        status: 'confirmed',
        time: modalEditTime,
        hours: modalEditHours,
        assignedCourts: newAssignedCourts
      });
      
      if (modalMode === 'confirm') {
        setBookingsList(prev => prev.filter(b => b.id !== modalBooking.id));
      } else {
        if (activeTab === 'bookings') fetchBookingsList(bookingTab);
        if (activeTab === 'schedule') fetchConfirmedBookings();
      }
      
      closeConfirmModal();
    } catch (err) {
      console.error(err);
      alert('Failed to save booking.');
    } finally {
      setModalSaving(false);
    }
  };

  // ----------------------------------------------------
  // Schedule Grid Mapping
  // ----------------------------------------------------
  const getBookingForCourtAndTime = (courtNumber, timeStr) => {
    return confirmedBookings.find(b => {
      if (b.assignedCourts) {
        return b.assignedCourts.some(ac => ac.court === courtNumber && ac.time === timeStr);
      } else if (b.courtNumber) {
        if (b.courtNumber !== courtNumber) return false;
        const startIdx = timeOptions.indexOf(b.time);
        const hours = parseInt(b.hours.split(' ')[0], 10) || 1;
        const checkIdx = timeOptions.indexOf(timeStr);
        return checkIdx >= startIdx && checkIdx < startIdx + hours;
      }
      return false;
    });
  };

  // ----------------------------------------------------
  // Rates
  // ----------------------------------------------------
  const handleSaveRates = async (e) => {
    e.preventDefault();
    setRatesSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'rates'), ratesConfig);
      alert('Rates configuration saved successfully!');
    } catch (err) {
      console.error('Error saving rates:', err);
      alert('Failed to save rates.');
    } finally {
      setRatesSaving(false);
    }
  };

  const handlePrimeRateChange = (sport, val) => {
    setRatesConfig({
      ...ratesConfig,
      primeRates: {
        ...ratesConfig.primeRates,
        [sport]: Number(val)
      }
    });
  };

  return (
    <div className="min-h-screen bg-navy-900 p-8 relative">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          
          <div className="flex bg-navy-800 rounded-lg p-1 border border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-2 rounded-md font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'bookings' ? 'bg-gold-500 text-navy-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-2 rounded-md font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'schedule' ? 'bg-gold-500 text-navy-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`px-6 py-2 rounded-md font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'rates' ? 'bg-gold-500 text-navy-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Manage Rates
            </button>
          </div>
        </div>

        {/* --- BOOKINGS TAB --- */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex gap-6 mb-6 border-b border-white/10 pb-2">
              <button
                onClick={() => setBookingTab('pending')}
                className={`font-semibold text-lg transition-colors pb-2 border-b-2 ${bookingTab === 'pending' ? 'text-gold-500 border-gold-500' : 'text-white/50 border-transparent hover:text-white'}`}
              >
                Pending Requests
              </button>
              <button
                onClick={() => setBookingTab('confirmed')}
                className={`font-semibold text-lg transition-colors pb-2 border-b-2 ${bookingTab === 'confirmed' ? 'text-gold-500 border-gold-500' : 'text-white/50 border-transparent hover:text-white'}`}
              >
                Confirmed Bookings
              </button>
            </div>

            {loading ? (
              <div className="text-white">Loading bookings...</div>
            ) : bookingsList.length === 0 ? (
              <div className="bg-navy-800 p-8 rounded-xl border border-white/10 text-center">
                <p className="text-white/60">No {bookingTab} bookings.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookingsList.map((booking) => (
                  <div key={booking.id} className="bg-navy-800 p-6 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-gold-500 text-lg mb-1">{booking.bookingNumber}</h3>
                      <p className="text-white mb-2">
                        {booking.name} | <span className="font-semibold text-gold-400">{booking.sport}</span> | {booking.date} @ {booking.time} ({booking.hours})
                      </p>
                      <p className="text-white/60 text-sm mb-2">
                        {booking.mobile} | {booking.email}
                      </p>
                      {bookingTab === 'confirmed' && booking.assignedCourts && (
                        <p className="text-sm font-semibold text-green-400">
                          Assigned: {booking.assignedCourts.map(ac => `${ac.time} (${ac.court})`).join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {bookingTab === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                            className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg whitespace-nowrap"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => openConfirmModal(booking, 'confirm')}
                            className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg whitespace-nowrap"
                          >
                            Confirm
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                          className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg whitespace-nowrap"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- SCHEDULE TAB --- */}
        {activeTab === 'schedule' && (
          <div className="bg-navy-800 rounded-xl border border-white/10 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-white/10">
              <div className="flex flex-wrap gap-2">
                {sportsList.map(sport => (
                  <button
                    key={sport}
                    onClick={() => setScheduleSport(sport)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${
                      scheduleSport === sport 
                        ? 'bg-white/10 border-gold-500 text-gold-500' 
                        : 'bg-navy-900 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 bg-navy-900 px-4 py-2 rounded-lg border border-white/10">
                <label htmlFor="scheduleDate" className="text-sm font-semibold text-white/60 uppercase">Date:</label>
                <input 
                  type="date" 
                  id="scheduleDate"
                  className="bg-transparent text-white outline-none"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
            </div>

            {scheduleLoading ? (
              <div className="text-white py-12 text-center">Loading schedule...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="p-4 border border-white/10 text-gold-500 bg-navy-900 font-semibold w-[120px]">Time</th>
                      {getCourtOptions(scheduleSport).map(c => (
                        <th key={c} className="p-4 border border-white/10 text-white bg-navy-900 font-semibold text-center">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeOptions.map(time => (
                      <tr key={time} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 border border-white/10 text-white font-medium whitespace-nowrap bg-navy-900/50">
                          {time}
                        </td>
                        {getCourtOptions(scheduleSport).map(c => {
                          const booking = getBookingForCourtAndTime(c, time);
                          return (
                            <td key={c} className={`p-4 border border-white/10 text-center transition-colors ${
                              booking ? 'bg-red-500/10' : ''
                            }`}>
                              {booking ? (
                                <div className="flex flex-col items-center relative group">
                                  <span className="text-white font-bold text-sm">{booking.name}</span>
                                  <span className="text-white/50 text-[0.75rem]">{booking.bookingNumber}</span>
                                  
                                  {/* Edit Button Overlay */}
                                  <button 
                                    onClick={() => openConfirmModal(booking, 'edit')}
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-navy-900/90 text-white px-3 py-1 rounded-md text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20"
                                  >
                                    Edit Court
                                  </button>
                                </div>
                              ) : (
                                <span className="text-green-400/50 text-sm font-medium">Available</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- RATES TAB --- */}
        {activeTab === 'rates' && (
          <form onSubmit={handleSaveRates} className="bg-navy-800 rounded-xl border border-white/10 p-8 max-w-[600px]">
            <h2 className="text-xl font-bold text-white mb-6">Normal Base Hourly Rates (₱)</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {sportsList.map((sport) => (
                <div key={sport} className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-white/60 uppercase">{sport}</label>
                  <input
                    type="number"
                    required
                    className="px-4 py-2 bg-navy-900 border border-white/20 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                    value={ratesConfig[sport] || ''}
                    onChange={(e) => setRatesConfig({ ...ratesConfig, [sport]: Number(e.target.value) })}
                  />
                </div>
              ))}
            </div>

            <div className="mb-6 pt-6 border-t border-white/10">
              <h2 className="text-xl font-bold text-white mb-2">Prime Time Settings</h2>
              <p className="text-white/50 text-sm mb-4">Set the hours when prime rates apply.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-white/60 uppercase">Start Hour (24H Format)</label>
                  <input
                    type="number"
                    min="0" max="23"
                    required
                    className="px-4 py-2 bg-navy-900 border border-white/20 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                    value={ratesConfig.primeStartHour}
                    onChange={(e) => setRatesConfig({ ...ratesConfig, primeStartHour: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-white/60 uppercase">End Hour (24H Format)</label>
                  <input
                    type="number"
                    min="0" max="23"
                    required
                    className="px-4 py-2 bg-navy-900 border border-white/20 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                    value={ratesConfig.primeEndHour}
                    onChange={(e) => setRatesConfig({ ...ratesConfig, primeEndHour: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-6 text-gold-400">Prime Time Hourly Rates (₱)</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {sportsList.map((sport) => (
                <div key={`prime-${sport}`} className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-white/60 uppercase">{sport}</label>
                  <input
                    type="number"
                    required
                    className="px-4 py-2 bg-navy-900 border border-gold-500/30 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                    value={ratesConfig.primeRates?.[sport] || ''}
                    onChange={(e) => handlePrimeRateChange(sport, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={ratesSaving}
              className="w-full py-3 bg-gold-500 text-navy-900 font-bold rounded-lg hover:bg-gold-400 disabled:opacity-70 transition-colors mt-4"
            >
              {ratesSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        )}

      </div>

      {/* --- CONFIRM/EDIT MODAL --- */}
      {modalVisible && modalBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy-800 border border-white/10 p-8 rounded-2xl w-full max-w-[500px] shadow-2xl relative">
            <button 
              onClick={closeConfirmModal}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {modalMode === 'confirm' ? 'Confirm Booking' : 'Edit Booking Courts'}
            </h2>
            <p className="text-white/60 text-sm mb-6 pb-6 border-b border-white/10">
              {modalBooking.name} • {modalBooking.bookingNumber}
              <br/>
              <span className="text-gold-400 font-semibold">{modalBooking.sport}</span> • {modalBooking.date}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold text-white/60 uppercase">Start Time</label>
                <select 
                  className="px-3 py-2 bg-navy-900 border border-white/20 rounded-lg text-white text-sm outline-none focus:border-gold-500 transition-colors"
                  value={modalEditTime}
                  onChange={(e) => setModalEditTime(e.target.value)}
                >
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold text-white/60 uppercase">Duration</label>
                {modalEditHours.includes('Custom') ? (
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      min="9" 
                      max="24"
                      className="px-3 py-2 bg-navy-900 border border-white/20 rounded-lg text-white text-sm outline-none focus:border-gold-500 transition-colors w-full"
                      value={modalEditHours.replace(' Custom', '')}
                      onChange={(e) => setModalEditHours(`${e.target.value} Custom`)}
                    />
                    <button 
                      onClick={() => setModalEditHours('1 Hour')}
                      className="px-3 bg-red-500 text-white rounded-md font-bold"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <select 
                    className="px-3 py-2 bg-navy-900 border border-white/20 rounded-lg text-white text-sm outline-none focus:border-gold-500 transition-colors"
                    value={modalEditHours}
                    onChange={(e) => setModalEditHours(e.target.value)}
                  >
                    {['1 Hour','2 Hours','3 Hours','4 Hours','5 Hours','6 Hours','7 Hours','8 Hours'].map(h => <option key={h} value={h}>{h}</option>)}
                    <option value="9 Custom">More than 8 Hours...</option>
                  </select>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-8">
              <h3 className="text-white font-semibold mb-1">Assign Courts by Hour</h3>
              {Array.from({ length: parseInt(modalEditHours.split(' ')[0], 10) || 1 }).map((_, i) => {
                const startIdx = timeOptions.indexOf(modalEditTime);
                const t = timeOptions[startIdx + i];
                if (!t) return <div key={i} className="text-red-400 text-sm">Time extends beyond closing.</div>;
                
                const available = modalAvailableCourtsMap[t] || [];
                const isWarning = available.length === 0;

                return (
                  <div key={t} className={`flex items-center justify-between p-3 rounded-lg border ${isWarning ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-navy-900/50'}`}>
                    <span className="text-white font-medium text-sm w-[100px]">{t}</span>
                    <select
                      className="px-3 py-1.5 bg-navy-900 border border-white/20 rounded-md text-white text-sm outline-none focus:border-gold-500 w-[140px]"
                      value={modalAssignedCourts[t] || ''}
                      onChange={(e) => setModalAssignedCourts({ ...modalAssignedCourts, [t]: e.target.value })}
                    >
                      <option value="" disabled>Select Court</option>
                      {available.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={closeConfirmModal}
                className="px-6 py-2 rounded-lg font-bold text-white hover:bg-white/10 transition-colors"
              >
                 Cancel
              </button>
              <button 
                onClick={handleSaveModal}
                disabled={modalSaving}
                className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg disabled:opacity-70"
              >
                {modalSaving ? 'Saving...' : 'Save & Confirm'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
