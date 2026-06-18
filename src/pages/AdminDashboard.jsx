import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.js';

// ─── Constants ───────────────────────────────────────────────
const sportCapacities = { BADMINTON: 4, PICKLEBALL: 4, BASKETBALL: 1, BILLIARDS: 2 };
const sportsList = ['BADMINTON', 'PICKLEBALL', 'BASKETBALL', 'BILLIARDS'];

// ─── Helpers ──────────────────────────────────────────────────
const to24h = (timeStr) => {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(' ');
  let [h] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h;
};

// Handles midnight wrap: e.g. start=18, end=0 means 18,19,20,21,22,23
const isPrimeHour = (hour24, startHour, endHour) => {
  if (startHour == null || endHour == null) return false;
  if (startHour === endHour) return false; // no prime window
  if (startHour < endHour) {
    // Normal range: e.g. 17–22
    return hour24 >= startHour && hour24 < endHour;
  }
  // Wrap-around range: e.g. 18–0 means 18..23
  return hour24 >= startHour || hour24 < endHour;
};

const calcBookingTotal = (sport, startTime, hoursStr, rates, timeOpts) => {
  const h = parseInt((hoursStr || '1').split(' ')[0], 10) || 1;
  const startIdx = timeOpts.indexOf(startTime);
  if (startIdx === -1) return 0;
  let total = 0;
  for (let i = 0; i < h; i++) {
    const t = timeOpts[startIdx + i];
    if (!t) break;
    const hour24 = to24h(t);
    const prime = isPrimeHour(hour24, rates.primeStartHour, rates.primeEndHour);
    const rate = prime
      ? (rates.primeRates?.[sport] ?? rates[sport] ?? 0)
      : (rates[sport] ?? 0);
    total += rate;
  }
  return total;
};
const timeOptions = [
  '08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM',
  '06:00 PM','07:00 PM','08:00 PM','09:00 PM','10:00 PM',
  '11:00 PM','12:00 AM','01:00 AM',
];
const ALL_STATUSES = ['pending','confirmed','rejected','expired','completed'];

// ─── Status Config ────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { label: 'Pending',   color: 'text-amber-400',  bg: 'bg-amber-400/15',   border: 'border-amber-400/30'   },
  confirmed: { label: 'Confirmed', color: 'text-green-400',  bg: 'bg-green-400/15',   border: 'border-green-400/30'   },
  rejected:  { label: 'Rejected',  color: 'text-red-400',    bg: 'bg-red-400/15',     border: 'border-red-400/30'     },
  expired:   { label: 'Expired',   color: 'text-gray-400',   bg: 'bg-gray-400/15',    border: 'border-gray-400/30'    },
  completed: { label: 'Completed', color: 'text-blue-400',   bg: 'bg-blue-400/15',    border: 'border-blue-400/30'    },
  cancelled: { label: 'Cancelled', color: 'text-orange-400', bg: 'bg-orange-400/15',  border: 'border-orange-400/30'  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.bg.replace('/15','')} ${cfg.color.replace('text-','bg-')}`} />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, icon, color = 'text-gold-500', sub }) {
  return (
    <div className="bg-navy-800 border border-white/10 rounded-xl p-5 flex items-start gap-4">
      <div className={`text-2xl flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center`}>{icon}</div>
      <div className="min-w-0">
        <div className={`text-2xl font-extrabold font-display ${color}`}>{value}</div>
        <div className="text-xs text-white/50 font-medium mt-0.5">{label}</div>
        {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');

  // ── Bookings ──
  const [bookingTab, setBookingTab] = useState('pending');
  const [allBookings, setAllBookings] = useState([]); // all bookings for current tab (pre-filter)
  const [loading, setLoading] = useState(true);

  // ── Search & Filter ──
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSport, setFilterSport] = useState('');

  // ── Stats ──
  const [stats, setStats] = useState({ pending: 0, confirmedToday: 0, weekTotal: 0, topSport: '—' });
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Schedule ──
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleSport, setScheduleSport] = useState('BADMINTON');
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // ── Rates ──
  const [ratesConfig, setRatesConfig] = useState({
    BADMINTON: 300, PICKLEBALL: 300, BASKETBALL: 500, BILLIARDS: 200,
    primeRates: { BADMINTON: 350, PICKLEBALL: 350, BASKETBALL: 550, BILLIARDS: 250 },
    primeStartHour: 17, primeEndHour: 22,
  });
  const [ratesSaving, setRatesSaving] = useState(false);

  // ── Confirm/Edit Modal ──
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('confirm');
  const [modalBooking, setModalBooking] = useState(null);
  const [modalEditTime, setModalEditTime] = useState('');
  const [modalEditHours, setModalEditHours] = useState('1 Hour');
  const [modalAssignedCourts, setModalAssignedCourts] = useState({});
  const [modalAvailableCourtsMap, setModalAvailableCourtsMap] = useState({});
  const [modalSaving, setModalSaving] = useState(false);

  // ── Action Modal (reject/cancel/restore) ──
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionModalConfig, setActionModalConfig] = useState({ id: null, status: '', title: '', message: '' });
  const [actionSaving, setActionSaving] = useState(false);

  // ── Notes ──
  const [noteEditId, setNoteEditId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  // ─── Fetch Statistics ─────────────────────────────────────
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const allSnap = await getDocs(collection(db, 'bookings'));
      const allDocs = allSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const pending = allDocs.filter(b => b.status === 'pending').length;
      const confirmedToday = allDocs.filter(b => b.status === 'confirmed' && b.date === today).length;
      const weekTotal = allDocs.filter(b => b.createdAt?.toDate?.()?.toISOString().split('T')[0] >= weekAgoStr).length;

      // Most popular sport from all confirmed bookings
      const sportCounts = {};
      allDocs.filter(b => b.status === 'confirmed').forEach(b => {
        sportCounts[b.sport] = (sportCounts[b.sport] || 0) + 1;
      });
      const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

      setStats({ pending, confirmedToday, weekTotal, topSport });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // ─── Fetch Bookings List ──────────────────────────────────
  const fetchBookingsList = async (status) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'bookings'), where('status', '==', status));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Sort newest first
      data.sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || new Date(0);
        const tb = b.createdAt?.toDate?.() || new Date(0);
        return tb - ta;
      });
      setAllBookings(data);
    } catch (err) {
      console.error(`Error fetching ${status} bookings:`, err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Filtered/Searched bookings (client-side) ─────────────
  const filteredBookings = useMemo(() => {
    let result = allBookings;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(b =>
        b.bookingNumber?.toLowerCase().includes(q) ||
        b.name?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q) ||
        b.mobile?.toLowerCase().includes(q)
      );
    }
    if (filterDate) result = result.filter(b => b.date === filterDate);
    if (filterSport) result = result.filter(b => b.sport === filterSport);
    return result;
  }, [allBookings, searchQuery, filterDate, filterSport]);

  // ─── Fetch Confirmed Bookings for Schedule ────────────────
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

  // ─── Fetch Rates ──────────────────────────────────────────
  const fetchRatesConfig = async () => {
    try {
      const docRef = await getDoc(doc(db, 'settings', 'rates'));
      if (docRef.exists()) {
        const data = docRef.data();
        if (!data.primeRates) {
          data.primeRates = { BADMINTON: data.BADMINTON || 300, PICKLEBALL: data.PICKLEBALL || 300, BASKETBALL: data.BASKETBALL || 500, BILLIARDS: data.BILLIARDS || 200 };
        }
        setRatesConfig(data);
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
    }
  };

  // ─── Auto-Expire Pending Bookings ─────────────────────────
  const autoExpirePendingBookings = async () => {
    try {
      const q = query(collection(db, 'bookings'), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      const now = new Date();
      const expirePromises = [];

      snap.docs.forEach(d => {
        const b = d.data();
        if (!b.date || !b.time) return;

        // Parse booking end datetime
        const bookingDate = b.date; // e.g. "2026-06-18"
        const bookingTime = b.time; // e.g. "08:00 AM"
        const hours = parseInt((b.hours || '1 Hour').split(' ')[0], 10) || 1;

        // Convert 12h time to 24h
        const [timePart, period] = bookingTime.split(' ');
        let [h, m] = timePart.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;

        // Build the end datetime (start + duration)
        const endDate = new Date(`${bookingDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
        endDate.setHours(endDate.getHours() + hours);

        if (endDate < now) {
          expirePromises.push(
            updateDoc(doc(db, 'bookings', d.id), { status: 'expired' })
          );
        }
      });

      if (expirePromises.length > 0) {
        await Promise.all(expirePromises);
        console.log(`Auto-expired ${expirePromises.length} pending booking(s)`);
      }
    } catch (err) {
      console.error('Error auto-expiring bookings:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      // Auto-expire first, then fetch fresh data
      autoExpirePendingBookings().then(() => {
        fetchBookingsList(bookingTab);
        fetchStats();
      });
      fetchRatesConfig(); // needed for cost calculation in confirm modal
    } else if (activeTab === 'schedule') {
      fetchConfirmedBookings();
    } else if (activeTab === 'rates') {
      fetchRatesConfig();
    }
  }, [activeTab, bookingTab, scheduleDate, scheduleSport]);

  // Reset filters when switching tabs
  useEffect(() => {
    setSearchQuery('');
    setFilterDate('');
    setFilterSport('');
  }, [bookingTab]);

  // ─── Courts ───────────────────────────────────────────────
  const getCourtOptions = (sport) => {
    const max = sportCapacities[sport] || 4;
    return Array.from({ length: max }, (_, i) => `Court ${i + 1}`);
  };

  // ─── Action Status Updates ────────────────────────────────
  const promptUpdateStatus = (id, newStatus) => {
    const map = {
      rejected:  { title: 'Reject Booking',    message: 'Are you sure you want to reject this booking?' },
      cancelled: { title: 'Cancel Booking',     message: 'Are you sure you want to cancel this confirmed booking?' },
      pending:   { title: 'Restore Booking',    message: 'Move this booking back to Pending for review?' },
      expired:   { title: 'Mark as Expired',    message: 'Mark this booking as expired?' },
      completed: { title: 'Mark as Completed',  message: 'Mark this booking as completed?' },
    };
    const cfg = map[newStatus] || { title: 'Update Status', message: 'Confirm status change?' };
    setActionModalConfig({ id, status: newStatus, ...cfg });
    setActionModalVisible(true);
  };

  const confirmActionStatus = async () => {
    setActionSaving(true);
    try {
      await updateDoc(doc(db, 'bookings', actionModalConfig.id), { status: actionModalConfig.status });
      setAllBookings(prev => prev.filter(b => b.id !== actionModalConfig.id));
      setActionModalVisible(false);
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking status.');
    } finally {
      setActionSaving(false);
    }
  };

  // ─── Notes ───────────────────────────────────────────────
  const startEditNote = (booking) => {
    setNoteEditId(booking.id);
    setNoteText(booking.adminNote || '');
  };

  const saveNote = async (id) => {
    setNoteSaving(true);
    try {
      await updateDoc(doc(db, 'bookings', id), { adminNote: noteText });
      setAllBookings(prev => prev.map(b => b.id === id ? { ...b, adminNote: noteText } : b));
      setNoteEditId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save note.');
    } finally {
      setNoteSaving(false);
    }
  };

  // ─── Confirm/Edit Modal ───────────────────────────────────
  const openConfirmModal = (booking, mode = 'confirm') => {
    setModalMode(mode);
    setModalBooking(booking);
    setModalEditTime(booking.time);
    setModalEditHours(booking.hours);
    const initialAssigned = {};
    if (booking.assignedCourts && Array.isArray(booking.assignedCourts)) {
      booking.assignedCourts.forEach(ac => { initialAssigned[ac.time] = ac.court; });
    } else if (booking.courtNumber) {
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

  const closeConfirmModal = () => { setModalVisible(false); setModalBooking(null); };

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
        const otherConfirmed = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(b => b.id !== modalBooking.id);
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
              b.assignedCourts.forEach(ac => { if (ac.time === t) takenCourts.add(ac.court); });
            } else if (b.courtNumber) {
              const bStartIdx = timeOptions.indexOf(b.time);
              const bH = parseInt(b.hours.split(' ')[0], 10) || 1;
              const checkIdx = timeOptions.indexOf(t);
              if (checkIdx >= bStartIdx && checkIdx < bStartIdx + bH) takenCourts.add(b.courtNumber);
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
            if (!next[t] || !availabilityMap[t].includes(next[t])) next[t] = availabilityMap[t][0] || '';
          }
          Object.keys(next).forEach(k => {
            const checkIdx = timeOptions.indexOf(k);
            if (checkIdx < startIdx || checkIdx >= startIdx + h) delete next[k];
          });
          return next;
        });
      } catch (err) { console.error('Error fetching modal availability:', err); }
    };
    fetchModalAvailability();
  }, [modalVisible, modalBooking, modalEditTime, modalEditHours]);

  const handleSaveModal = async () => {
    const startIdx = timeOptions.indexOf(modalEditTime);
    const h = parseInt(modalEditHours.split(' ')[0], 10) || 1;
    const newAssignedCourts = [];
    for (let i = 0; i < h; i++) {
      const t = timeOptions[startIdx + i];
      if (!t) { alert('Booking extends past closing time.'); return; }
      const c = modalAssignedCourts[t];
      if (!c) { alert(`No court available for ${t}. Please adjust the time or courts.`); return; }
      newAssignedCourts.push({ time: t, court: c });
    }
    setModalSaving(true);
    try {
      await updateDoc(doc(db, 'bookings', modalBooking.id), {
        status: 'confirmed', time: modalEditTime, hours: modalEditHours, assignedCourts: newAssignedCourts,
      });
      if (modalMode === 'confirm') {
        setAllBookings(prev => prev.filter(b => b.id !== modalBooking.id));
      } else {
        if (activeTab === 'bookings') fetchBookingsList(bookingTab);
        if (activeTab === 'schedule') fetchConfirmedBookings();
      }
      fetchStats();
      closeConfirmModal();
    } catch (err) { console.error(err); alert('Failed to save booking.'); }
    finally { setModalSaving(false); }
  };

  // ─── Schedule Grid ────────────────────────────────────────
  const getBookingForCourtAndTime = (courtNumber, timeStr) => {
    return confirmedBookings.find(b => {
      if (b.assignedCourts) return b.assignedCourts.some(ac => ac.court === courtNumber && ac.time === timeStr);
      if (b.courtNumber) {
        if (b.courtNumber !== courtNumber) return false;
        const startIdx = timeOptions.indexOf(b.time);
        const hours = parseInt(b.hours.split(' ')[0], 10) || 1;
        const checkIdx = timeOptions.indexOf(timeStr);
        return checkIdx >= startIdx && checkIdx < startIdx + hours;
      }
      return false;
    });
  };

  // ─── Rates ────────────────────────────────────────────────
  const handleSaveRates = async (e) => {
    e.preventDefault();
    setRatesSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'rates'), ratesConfig);
      alert('Rates saved successfully!');
    } catch (err) { console.error(err); alert('Failed to save rates.'); }
    finally { setRatesSaving(false); }
  };

  const handlePrimeRateChange = (sport, val) => {
    setRatesConfig({ ...ratesConfig, primeRates: { ...ratesConfig.primeRates, [sport]: Number(val) } });
  };

  const SPORT_EMOJI = { BADMINTON: '🏸', PICKLEBALL: '🏓', BASKETBALL: '🏀', BILLIARDS: '🎱' };

  // ─── Tab button classes ───────────────────────────────────
  const bookingTabCls = (t) =>
    `font-semibold text-sm transition-colors pb-2 border-b-2 whitespace-nowrap ${bookingTab === t ? 'text-gold-500 border-gold-500' : 'text-white/50 border-transparent hover:text-white'}`;

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-navy-900 p-4 md:p-8 relative">
      <div className="max-w-[1200px] mx-auto">

        {/* ── Top Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex bg-navy-800 rounded-lg p-1 border border-white/10 overflow-x-auto">
            {[['bookings','Bookings'],['schedule','Schedule'],['rates','Manage Rates']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-6 py-2 rounded-md font-semibold transition-colors whitespace-nowrap ${activeTab === key ? 'bg-gold-500 text-navy-900' : 'text-white/70 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════ BOOKINGS TAB ════════════════ */}
        {activeTab === 'bookings' && (
          <div>
            {/* ── Stats Panel ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Pending Requests" value={statsLoading ? '…' : stats.pending} icon="⏳" color="text-amber-400" />
              <StatCard label="Confirmed Today" value={statsLoading ? '…' : stats.confirmedToday} icon="✅" color="text-green-400" />
              <StatCard label="Bookings This Week" value={statsLoading ? '…' : stats.weekTotal} icon="📅" color="text-blue-400" />
              <StatCard label="Most Popular Sport" value={statsLoading ? '…' : (SPORT_EMOJI[stats.topSport] || '')} icon="🏆" color="text-gold-500"
                sub={stats.topSport !== '—' ? stats.topSport : 'No data yet'} />
            </div>

            {/* ── Status Tabs ── */}
            <div className="flex gap-5 mb-5 border-b border-white/10 pb-2 overflow-x-auto">
              <button onClick={() => setBookingTab('pending')}   className={bookingTabCls('pending')}>Pending</button>
              <button onClick={() => setBookingTab('confirmed')} className={bookingTabCls('confirmed')}>Confirmed</button>
              <button onClick={() => setBookingTab('rejected')}  className={bookingTabCls('rejected')}>Rejected</button>
              <button onClick={() => setBookingTab('expired')}   className={bookingTabCls('expired')}>Expired</button>
              <button onClick={() => setBookingTab('completed')} className={bookingTabCls('completed')}>Completed</button>
            </div>

            {/* ── Search & Filters ── */}
            <div className="flex flex-col md:flex-row gap-3 mb-5">
              {/* Search */}
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or booking number…"
                  className="w-full pl-9 pr-4 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 outline-none focus:border-gold-500/50 transition-colors"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              {/* Filter: Date */}
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="px-3 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-gold-500/50 transition-colors [color-scheme:dark]"
              />
              {/* Filter: Sport */}
              <select
                value={filterSport}
                onChange={e => setFilterSport(e.target.value)}
                className="px-3 py-2.5 bg-navy-800 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-gold-500/50 transition-colors"
              >
                <option value="">All Sports</option>
                {sportsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {/* Clear Filters */}
              {(searchQuery || filterDate || filterSport) && (
                <button
                  onClick={() => { setSearchQuery(''); setFilterDate(''); setFilterSport(''); }}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>

            {/* ── Bookings List ── */}
            {loading ? (
              <div className="text-white/60 text-center py-12">Loading bookings…</div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-navy-800 p-10 rounded-xl border border-white/10 text-center">
                <p className="text-white/40">
                  {allBookings.length === 0
                    ? `No ${bookingTab} bookings.`
                    : 'No bookings match your search or filters.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    bookingTab={bookingTab}
                    noteEditId={noteEditId}
                    noteText={noteText}
                    noteSaving={noteSaving}
                    setNoteText={setNoteText}
                    startEditNote={startEditNote}
                    saveNote={saveNote}
                    cancelEditNote={() => setNoteEditId(null)}
                    promptUpdateStatus={promptUpdateStatus}
                    openConfirmModal={openConfirmModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════ SCHEDULE TAB ════════════════ */}
        {activeTab === 'schedule' && (
          <div className="bg-navy-800 rounded-xl border border-white/10 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-white/10">
              <div className="flex flex-wrap gap-2">
                {sportsList.map(sport => (
                  <button key={sport} onClick={() => setScheduleSport(sport)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${scheduleSport === sport ? 'bg-white/10 border-gold-500 text-gold-500' : 'bg-navy-900 border-white/10 text-white/60 hover:text-white'}`}>
                    {SPORT_EMOJI[sport]} {sport}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 bg-navy-900 px-4 py-2 rounded-lg border border-white/10">
                <label htmlFor="scheduleDate" className="text-sm font-semibold text-white/60 uppercase">Date:</label>
                <input type="date" id="scheduleDate" className="bg-transparent text-white outline-none [color-scheme:dark]"
                  value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
              </div>
            </div>

            {scheduleLoading ? (
              <div className="text-white py-12 text-center">Loading schedule…</div>
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
                        <td className="p-4 border border-white/10 text-white font-medium whitespace-nowrap bg-navy-900/50">{time}</td>
                        {getCourtOptions(scheduleSport).map(c => {
                          const booking = getBookingForCourtAndTime(c, time);
                          return (
                            <td key={c} className={`p-4 border border-white/10 text-center transition-colors ${booking ? 'bg-red-500/10' : ''}`}>
                              {booking ? (
                                <div className="flex flex-col items-center relative group">
                                  <span className="text-white font-bold text-sm">{booking.name}</span>
                                  <span className="text-white/50 text-[0.75rem]">{booking.bookingNumber}</span>
                                  <button onClick={() => openConfirmModal(booking, 'edit')}
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-navy-900/90 text-white px-3 py-1 rounded-md text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/20">
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

        {/* ════════════════ RATES TAB ════════════════ */}
        {activeTab === 'rates' && (
          <form onSubmit={handleSaveRates} className="bg-navy-800 rounded-xl border border-white/10 p-8 max-w-[600px]">
            <h2 className="text-xl font-bold text-white mb-6">Normal Base Hourly Rates (₱)</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {sportsList.map((sport) => (
                <div key={sport} className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-white/60 uppercase">{SPORT_EMOJI[sport]} {sport}</label>
                  <input type="number" required className="px-4 py-2 bg-navy-900 border border-white/20 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                    value={ratesConfig[sport] || ''} onChange={e => setRatesConfig({ ...ratesConfig, [sport]: Number(e.target.value) })} />
                </div>
              ))}
            </div>
            <div className="mb-6 pt-6 border-t border-white/10">
              <h2 className="text-xl font-bold text-white mb-2">Prime Time Settings</h2>
              <p className="text-white/50 text-sm mb-4">Set the hours when prime rates apply.</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-white/60 uppercase">Start Hour (24H)</label>
                  <input type="number" min="0" max="23" required className="px-4 py-2 bg-navy-900 border border-white/20 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                    value={ratesConfig.primeStartHour} onChange={e => setRatesConfig({ ...ratesConfig, primeStartHour: Number(e.target.value) })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-white/60 uppercase">End Hour (24H)</label>
                  <input type="number" min="0" max="23" required className="px-4 py-2 bg-navy-900 border border-white/20 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                    value={ratesConfig.primeEndHour} onChange={e => setRatesConfig({ ...ratesConfig, primeEndHour: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gold-400 mb-6">Prime Time Hourly Rates (₱)</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {sportsList.map((sport) => (
                <div key={`prime-${sport}`} className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-semibold text-white/60 uppercase">{SPORT_EMOJI[sport]} {sport}</label>
                  <input type="number" required className="px-4 py-2 bg-navy-900 border border-gold-500/30 rounded-lg text-white outline-none focus:border-gold-500 transition-colors"
                    value={ratesConfig.primeRates?.[sport] || ''} onChange={e => handlePrimeRateChange(sport, e.target.value)} />
                </div>
              ))}
            </div>
            <button type="submit" disabled={ratesSaving}
              className="w-full py-3 bg-gold-500 text-navy-900 font-bold rounded-lg hover:bg-gold-400 disabled:opacity-70 transition-colors mt-4">
              {ratesSaving ? 'Saving…' : 'Save Configuration'}
            </button>
          </form>
        )}
      </div>

      {/* ════════ CONFIRM/EDIT MODAL ════════ */}
      {modalVisible && modalBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy-800 border border-white/10 p-8 rounded-2xl w-full max-w-[500px] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeConfirmModal} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">{modalMode === 'confirm' ? 'Confirm Booking' : 'Edit Booking Courts'}</h2>
            <p className="text-white/60 text-sm mb-6 pb-6 border-b border-white/10">
              {modalBooking.name} • {modalBooking.bookingNumber}<br />
              <span className="text-gold-400 font-semibold">{modalBooking.sport}</span> • {modalBooking.date}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold text-white/60 uppercase">Start Time</label>
                <select className="px-3 py-2 bg-navy-900 border border-white/20 rounded-lg text-white text-sm outline-none focus:border-gold-500 transition-colors"
                  value={modalEditTime} onChange={e => setModalEditTime(e.target.value)}>
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.8rem] font-semibold text-white/60 uppercase">Duration</label>
                {modalEditHours.includes('Custom') ? (
                  <div className="flex gap-2">
                    <input type="number" min="9" max="24" className="px-3 py-2 bg-navy-900 border border-white/20 rounded-lg text-white text-sm outline-none focus:border-gold-500 transition-colors w-full"
                      value={modalEditHours.replace(' Custom', '')} onChange={e => setModalEditHours(`${e.target.value} Custom`)} />
                    <button onClick={() => setModalEditHours('1 Hour')} className="px-3 bg-red-500 text-white rounded-md font-bold">X</button>
                  </div>
                ) : (
                  <select className="px-3 py-2 bg-navy-900 border border-white/20 rounded-lg text-white text-sm outline-none focus:border-gold-500 transition-colors"
                    value={modalEditHours} onChange={e => setModalEditHours(e.target.value)}>
                    {['1 Hour','2 Hours','3 Hours','4 Hours','5 Hours','6 Hours','7 Hours','8 Hours'].map(h => <option key={h} value={h}>{h}</option>)}
                    <option value="9 Custom">More than 8 Hours…</option>
                  </select>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 mb-6">
              <h3 className="text-white font-semibold mb-1">Assign Courts by Hour</h3>
              {Array.from({ length: parseInt(modalEditHours.split(' ')[0], 10) || 1 }).map((_, i) => {
                const startIdx = timeOptions.indexOf(modalEditTime);
                const t = timeOptions[startIdx + i];
                if (!t) return <div key={i} className="text-red-400 text-sm">Time extends beyond closing.</div>;
                const available = modalAvailableCourtsMap[t] || [];
                const isWarning = available.length === 0;
                const hour24 = to24h(t);
                const prime = isPrimeHour(hour24, ratesConfig.primeStartHour, ratesConfig.primeEndHour);
                const slotRate = prime
                  ? (ratesConfig.primeRates?.[modalBooking.sport] ?? ratesConfig[modalBooking.sport] ?? 0)
                  : (ratesConfig[modalBooking.sport] ?? 0);
                return (
                  <div key={t} className={`flex items-center justify-between p-3 rounded-lg border ${isWarning ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-navy-900/50'}`}>
                    <span className="text-white font-medium text-sm w-[100px]">{t}</span>
                    {prime && (
                      <span className="text-[0.65rem] font-bold text-gold-400 bg-gold-400/10 border border-gold-400/30 px-1.5 py-0.5 rounded-full ml-1">PRIME</span>
                    )}
                    <span className="text-white/50 text-xs ml-auto mr-3">₱{slotRate.toLocaleString()}</span>
                    <select className="px-3 py-1.5 bg-navy-900 border border-white/20 rounded-md text-white text-sm outline-none focus:border-gold-500 w-[140px]"
                      value={modalAssignedCourts[t] || ''} onChange={e => setModalAssignedCourts({ ...modalAssignedCourts, [t]: e.target.value })}>
                      <option value="" disabled>Select Court</option>
                      {available.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>

            {/* ── Total Amount to Pay ── */}
            {(() => {
              const total = calcBookingTotal(modalBooking.sport, modalEditTime, modalEditHours, ratesConfig, timeOptions);
              const hours = parseInt((modalEditHours || '1').split(' ')[0], 10) || 1;
              return (
                <div className="mb-6 p-4 rounded-xl border border-gold-500/30 bg-gold-500/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-0.5">Total Amount to Pay</p>
                      <p className="text-white/40 text-xs">{hours} hr{hours > 1 ? 's' : ''} · {modalBooking.sport}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-extrabold text-gold-400">₱{total.toLocaleString()}</p>
                      <p className="text-white/30 text-xs">incl. prime time where applicable</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-3">
              <button onClick={closeConfirmModal} className="px-6 py-2 rounded-lg font-bold text-white hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={handleSaveModal} disabled={modalSaving} className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg disabled:opacity-70">
                {modalSaving ? 'Saving…' : 'Save & Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ ACTION CONFIRM MODAL ════════ */}
      {actionModalVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-navy-800 border border-white/10 p-8 rounded-2xl w-full max-w-[400px] shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-400">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{actionModalConfig.title}</h2>
            <p className="text-white/60 text-sm mb-7">{actionModalConfig.message}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setActionModalVisible(false)} className="px-6 py-2 rounded-lg font-bold text-white hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={confirmActionStatus} disabled={actionSaving}
                className={`px-6 py-2 text-white font-bold rounded-lg transition-colors shadow-lg disabled:opacity-70 ${
                  actionModalConfig.status === 'pending' ? 'bg-blue-500 hover:bg-blue-600' :
                  actionModalConfig.status === 'completed' ? 'bg-blue-500 hover:bg-blue-600' :
                  'bg-red-500 hover:bg-red-600'}`}>
                {actionSaving ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Booking Card Component ───────────────────────────────────
function BookingCard({ booking, bookingTab, noteEditId, noteText, noteSaving, setNoteText, startEditNote, saveNote, cancelEditNote, promptUpdateStatus, openConfirmModal }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const isEditingNote = noteEditId === booking.id;

  return (
    <div className="bg-navy-800 rounded-xl border border-white/10 overflow-hidden">
      <div className="p-5 flex flex-col md:flex-row justify-between md:items-start gap-4">
        {/* Left: booking info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="font-bold text-gold-500 text-base font-display">{booking.bookingNumber}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-white text-sm mb-1">
            <span className="font-semibold">{booking.name}</span>
            <span className="text-white/40 mx-2">·</span>
            <span className="font-bold text-gold-400">{booking.sport}</span>
            <span className="text-white/40 mx-2">·</span>
            {booking.date} @ {booking.time} ({booking.hours})
          </p>
          <p className="text-white/50 text-xs mb-2">{booking.mobile} · {booking.email}</p>
          {booking.status === 'confirmed' && booking.assignedCourts && (
            <p className="text-xs font-semibold text-green-400">
              Courts: {booking.assignedCourts.map(ac => `${ac.time} → ${ac.court}`).join(', ')}
            </p>
          )}
          {booking.adminNote && !isEditingNote && (
            <div className="mt-2 flex items-start gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white/30 mt-0.5 flex-shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <p className="text-xs text-white/40 italic leading-snug">{booking.adminNote}</p>
            </div>
          )}
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {/* Notes button */}
          <button
            onClick={() => setNoteOpen(o => !o)}
            title="Admin notes"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-xs font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Note {booking.adminNote ? '●' : ''}
          </button>

          {/* Status Actions */}
          {bookingTab === 'pending' && (
            <>
              <button onClick={() => promptUpdateStatus(booking.id, 'rejected')}
                className="px-4 py-2 bg-red-500/15 text-red-400 border border-red-500/30 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm whitespace-nowrap">
                Reject
              </button>
              <button onClick={() => openConfirmModal(booking, 'confirm')}
                className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg text-sm whitespace-nowrap">
                Confirm
              </button>
            </>
          )}
          {bookingTab === 'confirmed' && (
            <>
              <button onClick={() => openConfirmModal(booking, 'edit')}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold rounded-lg transition-colors text-sm whitespace-nowrap">
                Edit Court
              </button>
              <button onClick={() => promptUpdateStatus(booking.id, 'completed')}
                className="px-4 py-2 bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold rounded-lg hover:bg-blue-500 hover:text-white transition-all text-sm whitespace-nowrap">
                Complete
              </button>
              <button onClick={() => promptUpdateStatus(booking.id, 'cancelled')}
                className="px-4 py-2 bg-red-500/15 text-red-400 border border-red-500/30 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm whitespace-nowrap">
                Cancel
              </button>
            </>
          )}
          {(bookingTab === 'rejected' || bookingTab === 'expired') && (
            <button onClick={() => promptUpdateStatus(booking.id, 'pending')}
              className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors text-sm whitespace-nowrap">
              Restore
            </button>
          )}
          {bookingTab === 'completed' && (
            <span className="px-4 py-2 bg-blue-400/10 text-blue-400 border border-blue-400/25 font-bold rounded-lg text-sm">
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Notes Panel */}
      {noteOpen && (
        <div className="border-t border-white/10 bg-navy-900/50 px-5 py-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-semibold">Internal Admin Note</p>
          {isEditingNote ? (
            <div className="flex flex-col gap-2">
              <textarea
                rows={3}
                className="w-full px-3 py-2 bg-navy-800 border border-white/20 rounded-lg text-white text-sm outline-none focus:border-gold-500 transition-colors resize-none placeholder:text-white/20"
                placeholder="Add an internal note visible only to admins…"
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={cancelEditNote} className="px-4 py-1.5 rounded-lg text-white/60 hover:text-white text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={() => saveNote(booking.id)} disabled={noteSaving}
                  className="px-4 py-1.5 bg-gold-500 text-navy-900 rounded-lg text-sm font-bold hover:bg-gold-400 disabled:opacity-60 transition-colors">
                  {noteSaving ? 'Saving…' : 'Save Note'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <p className="text-sm text-white/60 flex-1 leading-relaxed italic">
                {booking.adminNote || <span className="text-white/25">No note yet.</span>}
              </p>
              <button onClick={() => startEditNote(booking)}
                className="flex-shrink-0 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/50 hover:text-white text-xs font-medium transition-colors">
                {booking.adminNote ? 'Edit' : '+ Add'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
