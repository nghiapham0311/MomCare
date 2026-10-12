import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import QuickLogModal from '../components/QuickLogModal';
import RoutineListView from '../components/RoutineListView';
import { buildDailyRoutine, formatDuration, formatTimeStr, getTimeDiffMinutes } from '../utils/routineHelper';
import {
  Sun,
  Moon,
  Milk,
  Baby as DiaperIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoonStar,
  SunMedium,
  UtensilsCrossed,
  Edit3,
  UserPlus,
  X,
  Check,
} from 'lucide-react';

const getLocalDateString = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const calculateWeekAge = (birthDateStr) => {
  if (!birthDateStr) return '';
  const [by, bm, bd] = birthDateStr.split('-').map(Number);
  if (!by || !bm || !bd) return '';
  const birth = new Date(by, bm - 1, bd);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (totalDays < 0) return 'Sắp sinh';
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  if (weeks === 0) return `${days} ngày tuổi`;
  return `${weeks} tuần${days > 0 ? ` ${days} ngày` : ' tuổi'}`;
};

export default function Dashboard() {
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Always default to TODAY in local timezone when opening the app
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());

  // Modal & FAB states
  const [showBabyModal, setShowBabyModal] = useState(false);
  const [isEditingBaby, setIsEditingBaby] = useState(false);
  const [savingBaby, setSavingBaby] = useState(false);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [quickLogType, setQuickLogType] = useState('WAKE');
  const [activityToEdit, setActivityToEdit] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [darkModeNotes, setDarkModeNotes] = useState(true);

  // Baby profile form state
  const [babyName, setBabyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('boy');

  useEffect(() => {
    // Clear any stale cached date from old versions so it never jumps to yesterday
    localStorage.removeItem('momcare_last_selected_date');
    setSelectedDate(getLocalDateString());
    fetchBabies();
  }, []);

  useEffect(() => {
    if (selectedBaby) {
      fetchActivities(selectedBaby.id);
    }
  }, [selectedBaby]);

  const fetchBabies = async () => {
    try {
      const res = await api.get('/babies/');
      setBabies(res.data);
      if (res.data.length > 0) {
        setSelectedBaby(res.data[0]);
      } else {
        openCreateBabyModal();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (babyId) => {
    try {
      const res = await api.get(`/activities/?baby_id=${babyId}&limit=300&order=asc`);
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditBabyModal = () => {
    if (!selectedBaby) return;
    setIsEditingBaby(true);
    setBabyName(selectedBaby.name || '');
    setBirthDate(selectedBaby.birth_date || '');
    setGender(selectedBaby.gender || 'boy');
    setShowBabyModal(true);
  };

  const openCreateBabyModal = () => {
    setIsEditingBaby(false);
    setBabyName('');
    setBirthDate(getLocalDateString());
    setGender('boy');
    setShowBabyModal(true);
  };

  const handleSaveBabyProfile = async (e) => {
    e.preventDefault();
    setSavingBaby(true);
    try {
      if (isEditingBaby && selectedBaby) {
        const res = await api.put(`/babies/${selectedBaby.id}`, {
          name: babyName.trim(),
          birth_date: birthDate,
          gender: gender,
        });
        const updatedBaby = res.data;
        setBabies((prev) => prev.map((b) => (b.id === updatedBaby.id ? updatedBaby : b)));
        setSelectedBaby(updatedBaby);
        setShowBabyModal(false);
      } else {
        const res = await api.post('/babies/', {
          name: babyName.trim(),
          birth_date: birthDate,
          gender: gender,
        });
        setBabies((prev) => [...prev, res.data]);
        setSelectedBaby(res.data);
        setShowBabyModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingBaby(false);
    }
  };

  // Filter activities strictly for the chosen date in the user's LOCAL browser timezone
  const dayActivities = useMemo(() => {
    return activities.filter((act) => {
      return getLocalDateString(new Date(act.start_time)) === selectedDate;
    });
  }, [activities, selectedDate]);

  // Build EASY routine data (Naps, WT, ST, Milk & Solid sums)
  const routineData = useMemo(() => {
    return buildDailyRoutine(dayActivities);
  }, [dayActivities]);

  // Auto-calculate baby's age in weeks and days based on birth_date
  const babyAgeText = useMemo(() => {
    return calculateWeekAge(selectedBaby?.birth_date);
  }, [selectedBaby]);

  // Auto-calculate feeding intervals (how long each feed is after the previous feed)
  const feedingIntervalData = useMemo(() => {
    const feeds = dayActivities
      .filter((a) => a.activity_type === 'FEED' || a.activity_type === 'SOLID_FOOD')
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    if (feeds.length === 0) return null;

    const steps = feeds.map((f, idx) => {
      const prev = idx > 0 ? feeds[idx - 1] : null;
      const diffMins = prev ? getTimeDiffMinutes(prev.start_time, f.start_time) : null;
      return {
        id: f.id,
        time: formatTimeStr(f.start_time),
        amountMl: f.details?.amount_ml,
        isSolid: f.activity_type === 'SOLID_FOOD',
        diffFormatted: diffMins !== null ? formatDuration(diffMins) : null,
      };
    });

    const latestDiff = steps.length > 1 ? steps[steps.length - 1].diffFormatted : null;

    return { steps, latestDiff, count: feeds.length };
  }, [dayActivities]);

  const handleDateChange = (daysOffset) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d + daysOffset);
    setSelectedDate(getLocalDateString(dateObj));
  };

  const isToday = useMemo(() => {
    return selectedDate === getLocalDateString();
  }, [selectedDate]);

  const formattedDateTitle = useMemo(() => {
    const [, month, day] = selectedDate.split('-').map(Number);
    return `${day}/${month}`;
  }, [selectedDate]);

  const handleSaveActivity = async (payload) => {
    if (!selectedBaby) return;

    try {
      if (payload.id) {
        // Edit existing
        const res = await api.put(`/activities/${payload.id}`, {
          baby_id: selectedBaby.id,
          activity_type: payload.activity_type,
          start_time: payload.start_time,
          details: payload.details,
          notes: payload.notes,
        });
        setActivities((prev) =>
          prev
            .map((a) => (a.id === payload.id ? res.data : a))
            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        );
      } else {
        // Create new
        const res = await api.post('/activities/', {
          baby_id: selectedBaby.id,
          activity_type: payload.activity_type,
          start_time: payload.start_time,
          details: payload.details,
          notes: payload.notes,
        });
        const savedAct = res.data;
        setActivities((prev) =>
          [...prev, savedAct].sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        );
        const actDate = getLocalDateString(new Date(savedAct.start_time));
        setSelectedDate(actDate);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await api.delete(`/activities/${id}`);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const openQuickLog = (actionType) => {
    setActivityToEdit(null);
    setQuickLogType(actionType);
    setQuickLogOpen(true);
  };

  const handleItemClick = (activity) => {
    setActivityToEdit(activity);
    setQuickLogType(activity.activity_type);
    setQuickLogOpen(true);
  };

  // Radial fan menu items (6 action items fanned across a 150° arc above bottom-center FAB)
  const fabRadius = 115;
  const fabItems = [
    { type: 'WAKE', label: 'Dậy', icon: <Sun size={19} />, bg: 'bg-amber-500 hover:bg-amber-600', ring: 'ring-amber-200' },
    { type: 'FEED', label: 'Bú (ml)', icon: <Milk size={19} />, bg: 'bg-orange-500 hover:bg-orange-600', ring: 'ring-orange-200' },
    { type: 'SOLID_FOOD', label: 'Ăn cháo', icon: <UtensilsCrossed size={19} />, bg: 'bg-lime-600 hover:bg-lime-700', ring: 'ring-lime-200' },
    { type: 'SLEEP', label: 'Ngủ', icon: <Moon size={19} />, bg: 'bg-indigo-600 hover:bg-indigo-700', ring: 'ring-indigo-200' },
    { type: 'DIAPER', label: 'Tã', icon: <DiaperIcon size={19} />, bg: 'bg-sky-500 hover:bg-sky-600', ring: 'ring-sky-200' },
    { type: 'NIGHT', label: 'Đêm', icon: <Sparkles size={19} />, bg: 'bg-purple-600 hover:bg-purple-700', ring: 'ring-purple-200' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-9 w-9 border-3 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-3.5 py-3 pb-28 sm:pb-12">
      {/* Top Header: Baby Profile (Click to edit name/DOB) & Date Navigator */}
      <div className="flex items-center justify-between mb-2.5 gap-2">
        {/* Baby Info & Profile Trigger */}
        {selectedBaby && (
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={openEditBabyModal}
              className="group flex items-center gap-1.5 text-left py-1 px-2 -ml-2 rounded-xl hover:bg-pink-50/80 transition min-w-0"
              title="Bấm để cập nhật tên bé & ngày tháng năm sinh"
            >
              <span className="text-xl flex-shrink-0">
                {selectedBaby.gender === 'girl' ? '👧' : '👶'}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-gray-800 group-hover:text-pink-600 text-sm leading-tight truncate transition">
                    {selectedBaby.name}
                  </span>
                  {babyAgeText && (
                    <span className="text-[11px] font-semibold bg-pink-50 text-pink-600 border border-pink-200/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                      🎂 {babyAgeText}
                    </span>
                  )}
                  <Edit3
                    size={13}
                    className="text-gray-400 group-hover:text-pink-600 flex-shrink-0 transition"
                  />
                </div>
              </div>
            </button>

            {babies.length > 1 && (
              <select
                value={selectedBaby.id}
                onChange={(e) => {
                  const found = babies.find((b) => b.id === e.target.value);
                  if (found) setSelectedBaby(found);
                }}
                className="text-[11px] font-semibold text-pink-600 bg-white border border-pink-200 rounded-lg px-1.5 py-0.5 focus:outline-none cursor-pointer"
                title="Đổi bé"
              >
                {babies.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Date Navigator */}
        <div className="flex items-center gap-1 bg-white border border-gray-200/90 rounded-xl px-2 py-1 shadow-sm flex-shrink-0">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-1 text-gray-500 hover:text-gray-800 transition"
            title="Hôm trước"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1 px-1 relative">
            <span className="text-xs font-bold text-gray-800">{formattedDateTitle}</span>
            {isToday ? (
              <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-1.5 py-0.2 rounded-md">
                Nay
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedDate(getLocalDateString())}
                className="text-[10px] bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-700 font-semibold px-1.5 py-0.2 rounded-md transition"
                title="Về hôm nay"
              >
                Về nay
              </button>
            )}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="w-6 h-5 opacity-0 absolute left-0 cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleDateChange(1)}
            disabled={isToday}
            className={`p-1 transition ${
              isToday ? 'text-gray-300' : 'text-gray-500 hover:text-gray-800'
            }`}
            title="Hôm sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Sticky Day Summary Bar (WT • ST • Sữa • Cháo) */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 text-white rounded-2xl px-4 py-2.5 shadow-md mb-2.5 flex items-center justify-between font-mono">
        <div className="flex items-center gap-3.5 text-xs font-bold flex-wrap">
          <div>
            <span className="text-gray-400 text-[10px] uppercase block tracking-wider font-sans">
              WT (Thức)
            </span>
            <span className="text-emerald-400 text-sm">
              {routineData.totals.wtFormatted || '0p'}
            </span>
          </div>

          <div className="w-[1px] h-6 bg-zinc-800" />

          <div>
            <span className="text-gray-400 text-[10px] uppercase block tracking-wider font-sans">
              ST (Ngủ)
            </span>
            <span className="text-sky-400 text-sm">
              {routineData.totals.stFormatted || '0p'}
            </span>
          </div>

          <div className="w-[1px] h-6 bg-zinc-800" />

          <div>
            <span className="text-gray-400 text-[10px] uppercase block tracking-wider font-sans">
              Sữa
            </span>
            <span className="text-amber-400 text-sm">
              {routineData.totals.milkMl}ml
            </span>
          </div>

          {routineData.totals.solidMl > 0 && (
            <>
              <div className="w-[1px] h-6 bg-zinc-800" />
              <div>
                <span className="text-gray-400 text-[10px] uppercase block tracking-wider font-sans">
                  Cháo
                </span>
                <span className="text-lime-400 text-sm">
                  {routineData.totals.solidMl}ml
                </span>
              </div>
            </>
          )}
        </div>

        {/* View Style Switcher (Dark / Light Notes) */}
        <button
          onClick={() => setDarkModeNotes(!darkModeNotes)}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition text-[11px]"
          title="Đổi màu nền Note"
        >
          {darkModeNotes ? <SunMedium size={15} /> : <MoonStar size={15} />}
        </button>
      </div>

      {/* Feeding Interval Bar (Auto-calculates time between consecutive feeds) */}
      {feedingIntervalData && (
        <div className="bg-orange-50/90 border border-orange-200/90 text-orange-950 rounded-2xl px-3 py-2 mb-2.5 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold text-orange-800 flex items-center gap-1">
              🍼 Khoảng cách các cữ ăn ({feedingIntervalData.count} cữ)
            </span>
            {feedingIntervalData.latestDiff && (
              <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                Cữ cuối cách cữ trước: {feedingIntervalData.latestDiff}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap py-0.5 text-[11px] font-mono">
            {feedingIntervalData.steps.map((step, i) => (
              <React.Fragment key={step.id || i}>
                {i > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-orange-200/70 text-orange-900 font-bold text-[10px]">
                    +{step.diffFormatted}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg border font-semibold ${
                    step.isSolid
                      ? 'bg-lime-100/80 border-lime-300 text-lime-900'
                      : 'bg-white border-orange-200 text-gray-800'
                  }`}
                >
                  <span>{step.isSolid ? '🥣' : '🍼'}</span>
                  <span>{step.time}</span>
                  {step.amountMl ? (
                    <span className="text-[10px] text-gray-500">({step.amountMl}ml)</span>
                  ) : null}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Routine Minimalist List View */}
      <RoutineListView
        routineData={routineData}
        onItemClick={handleItemClick}
        darkMode={darkModeNotes}
        latestAvailableDate={
          activities.length > 0
            ? getLocalDateString(new Date(activities[activities.length - 1].start_time))
            : null
        }
        onJumpToDate={(d) => {
          setSelectedDate(d);
        }}
      />

      {/* Floating Action Button (FAB) with Radial Fan Menu — Perfectly centered in bottom navbar */}
      {fabOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setFabOpen(false)}
        />
      )}

      <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-14 h-14 flex items-center justify-center">
        {/* Fan Menu Items anchored at exact center (50%, 50%) */}
        {fabItems.map((item, index) => {
          // Distribute 6 items evenly across a 150° arc (from 165° left to 15° right)
          const angleDeg = 165 - index * (150 / (fabItems.length - 1));
          const angleRad = (angleDeg * Math.PI) / 180;
          const targetX = Math.round(fabRadius * Math.cos(angleRad));
          const targetY = -Math.round(fabRadius * Math.sin(angleRad));

          return (
            <div
              key={item.type}
              className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center"
              style={{
                transform: fabOpen
                  ? `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) scale(1)`
                  : 'translate(-50%, -50%) scale(0)',
                opacity: fabOpen ? 1 : 0,
                pointerEvents: fabOpen ? 'auto' : 'none',
                transition:
                  'transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease',
                transitionDelay: fabOpen ? `${index * 25}ms` : '0ms',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  openQuickLog(item.type);
                  setFabOpen(false);
                }}
                className={`w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center ring-2 ${item.ring} ${item.bg} active:scale-90 transition-transform`}
                aria-label={item.label}
              >
                {item.icon}
              </button>
              <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md backdrop-blur-xs whitespace-nowrap mt-1 leading-none select-none shadow-xs">
                {item.label}
              </span>
            </div>
          );
        })}

        {/* Central + Button (rotates 45° to X when open) */}
        <button
          type="button"
          onClick={() => setFabOpen(!fabOpen)}
          className={`relative z-10 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 border-4 border-white ${
            fabOpen
              ? 'bg-rose-600 hover:bg-rose-700 rotate-45'
              : 'bg-pink-500 hover:bg-pink-600'
          }`}
          aria-label="Thêm hoạt động"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Quick Log & Edit Modal */}
      <QuickLogModal
        isOpen={quickLogOpen}
        onClose={() => {
          setQuickLogOpen(false);
          setActivityToEdit(null);
        }}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
        initialType={quickLogType}
        activityToEdit={activityToEdit}
        currentDate={selectedDate}
      />

      {/* Baby Profile Modal (Update existing baby name/DOB or Create new baby) */}
      {showBabyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-pink-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                {isEditingBaby ? '👶 Cập nhật hồ sơ của bé' : '➕ Tạo hồ sơ bé mới'}
              </h3>
              {babies.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBabyModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <form onSubmit={handleSaveBabyProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Tên của bé
                </label>
                <input
                  type="text"
                  required
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="Ví dụ: Ánh Kim, Bé Bơ..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-600">
                    Ngày tháng năm sinh
                  </label>
                  {birthDate && (
                    <span className="text-[11px] font-bold text-pink-600">
                      🎂 {calculateWeekAge(birthDate)}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Giới tính
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('girl')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      gender === 'girl'
                        ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    👧 Bé Gái
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('boy')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                      gender === 'boy'
                        ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    👦 Bé Trai
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {babies.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowBabyModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingBaby}
                  className="flex-[2] py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-md shadow-pink-200 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Check size={16} />
                  <span>{savingBaby ? 'Đang lưu...' : isEditingBaby ? 'Lưu cập nhật' : 'Tạo hồ sơ'}</span>
                </button>
              </div>

              {isEditingBaby && (
                <div className="pt-2 border-t border-gray-100 text-center">
                  <button
                    type="button"
                    onClick={openCreateBabyModal}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-pink-600 transition"
                  >
                    <UserPlus size={13} />
                    <span>Thêm hồ sơ bé khác</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
