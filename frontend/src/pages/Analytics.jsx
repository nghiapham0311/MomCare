import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  CalendarDays,
  Milk,
  Moon,
  Baby as DiaperIcon,
  HeartPulse,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Scale,
  Ruler,
  Plus,
  Trash2,
  X,
  Check,
} from 'lucide-react';

const getLocalDateString = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function Analytics() {
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [dailySummary, setDailySummary] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [growthLogs, setGrowthLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Growth modal states
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [growthDate, setGrowthDate] = useState(() => getLocalDateString());
  const [growthWeight, setGrowthWeight] = useState('');
  const [growthHeight, setGrowthHeight] = useState('');
  const [growthHead, setGrowthHead] = useState('');
  const [growthNotes, setGrowthNotes] = useState('');
  const [growthSaving, setGrowthSaving] = useState(false);

  useEffect(() => {
    fetchBabies();
  }, []);

  useEffect(() => {
    if (selectedBaby) {
      fetchDailySummary();
      fetchWeeklySummary();
      fetchGrowthLogs();
    }
  }, [selectedBaby, selectedDate]);

  const fetchBabies = async () => {
    try {
      const res = await api.get('/babies/');
      setBabies(res.data);
      if (res.data.length > 0) {
        setSelectedBaby(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const res = await api.get(`/summary/daily?baby_id=${selectedBaby.id}&date=${selectedDate}`);
      setDailySummary(res.data);
    } catch (err) {
      console.error(err);
      setDailySummary(null);
    }
  };

  const fetchWeeklySummary = async () => {
    try {
      const res = await api.get(`/summary/weekly?baby_id=${selectedBaby.id}&end_date=${selectedDate}`);
      setWeeklySummary(res.data);
    } catch (err) {
      console.error(err);
      setWeeklySummary([]);
    }
  };

  const fetchGrowthLogs = async () => {
    try {
      const res = await api.get(`/growth/?baby_id=${selectedBaby.id}`);
      setGrowthLogs(res.data || []);
    } catch (err) {
      console.error(err);
      setGrowthLogs([]);
    }
  };

  const changeDate = (offset) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d + offset);
    setSelectedDate(getLocalDateString(dateObj));
  };

  const formatDateVN = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  const isToday = selectedDate === getLocalDateString();

  // Chart data focusing strictly on milk ml per day (Requirement 1)
  const chartData = weeklySummary.map((day) => ({
    name: formatDateVN(day.date),
    'Lượng sữa (ml)': Math.round(day.feed_total_ml || 0),
    'Cháo (ml)': Math.round(day.solid_total_ml || 0),
    feed_count: day.feed_count || 0,
  }));

  const hasSolidFood = chartData.some((d) => d['Cháo (ml)'] > 0);

  // Growth handling (Requirement 2)
  const handleOpenGrowthModal = () => {
    setGrowthDate(getLocalDateString());
    setGrowthWeight('');
    setGrowthHeight('');
    setGrowthHead('');
    setGrowthNotes('');
    setShowGrowthModal(true);
  };

  const handleSaveGrowthLog = async (e) => {
    e.preventDefault();
    if (!selectedBaby) return;
    setGrowthSaving(true);
    try {
      const payload = {
        baby_id: selectedBaby.id,
        logged_date: growthDate,
        weight_kg: growthWeight ? parseFloat(growthWeight) : null,
        height_cm: growthHeight ? parseFloat(growthHeight) : null,
        head_circ_cm: growthHead ? parseFloat(growthHead) : null,
        notes: growthNotes.trim() || null,
      };
      await api.post('/growth/', payload);
      await fetchGrowthLogs();
      setShowGrowthModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setGrowthSaving(false);
    }
  };

  const handleDeleteGrowthLog = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bản ghi cân đo này?')) return;
    try {
      await api.delete(`/growth/${id}`);
      setGrowthLogs((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const latestGrowth = growthLogs.length > 0 ? growthLogs[0] : null;

  // Growth chart data sorted chronologically
  const growthChartData = [...growthLogs]
    .sort((a, b) => new Date(a.logged_date) - new Date(b.logged_date))
    .map((log) => {
      const [y, m, d] = log.logged_date.split('-').map(Number);
      return {
        date: `${d}/${m}`,
        'Cân nặng (kg)': log.weight_kg !== null ? Number(log.weight_kg) : null,
        'Chiều cao (cm)': log.height_cm !== null ? Number(log.height_cm) : null,
      };
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!selectedBaby) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <p className="text-sm text-gray-500">Chưa có thông tin bé. Vui lòng thêm bé ở trang chủ trước.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-28 sm:pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <TrendingUp size={22} className="text-pink-500" />
          <h1 className="text-lg font-bold text-gray-800">
            Thống kê của {selectedBaby.name}
          </h1>
        </div>

        {/* Baby Switcher (if multiple) */}
        {babies.length > 1 && (
          <select
            value={selectedBaby.id}
            onChange={(e) => {
              const b = babies.find((x) => x.id === e.target.value);
              if (b) setSelectedBaby(b);
            }}
            className="text-xs font-semibold text-pink-600 bg-white border border-pink-200 rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
          >
            {babies.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Date Navigator */}
      <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-gray-200/80 flex items-center justify-between mb-4">
        <button
          onClick={() => changeDate(-1)}
          className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 transition active:scale-95"
          title="Hôm trước"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-pink-500" />
          <span className="text-sm font-bold text-gray-800">
            {formatDateVN(selectedDate)}
          </span>
          {isToday && (
            <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-1.5 py-0.2 rounded-md">
              Nay
            </span>
          )}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            className="w-4 h-4 opacity-0 absolute cursor-pointer"
          />
        </div>

        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className={`p-1.5 rounded-xl transition ${
            isToday ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-600 active:scale-95'
          }`}
          title="Hôm sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 1. Daily Summary: Focused on Milk Volume (Requirement 1) */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Lượng sữa trong ngày
        </h3>

        {dailySummary ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Primary Milk Card */}
            <div className="sm:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
                  <Milk size={18} className="text-orange-500" />
                  <span>Tổng lượng sữa</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-orange-600">
                    {Math.round(dailySummary.feed_total_ml || 0)}
                  </span>
                  <span className="text-sm font-bold text-orange-700">ml</span>
                </div>
                <p className="text-[11px] font-semibold text-amber-700 mt-1">
                  Đã nạp qua {dailySummary.feed_count || 0} cữ bú
                  {dailySummary.solid_total_ml > 0 && ` • ${Math.round(dailySummary.solid_total_ml)}ml cháo`}
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-orange-100/80 flex items-center justify-center text-2xl">
                🍼
              </div>
            </div>

            {/* Quick Secondary Stats (Giấc ngủ & Tã) */}
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2.5">
              <div className="bg-indigo-50/70 rounded-2xl p-3 border border-indigo-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                  <Moon size={14} className="text-indigo-600" />
                  <span>Giấc ngủ</span>
                </div>
                <p className="text-base font-extrabold text-indigo-700 mt-0.5">
                  {dailySummary.sleep_count || 0} <span className="text-xs font-normal">giấc</span>
                </p>
              </div>

              <div className="bg-sky-50/70 rounded-2xl p-3 border border-sky-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                  <DiaperIcon size={14} className="text-sky-600" />
                  <span>Thay tã</span>
                </div>
                <p className="text-base font-extrabold text-sky-700 mt-0.5">
                  {dailySummary.diaper_count || 0} <span className="text-xs font-normal">lần</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center text-xs text-gray-400 border border-gray-100 shadow-sm">
            Chưa có dữ liệu cho ngày này.
          </div>
        )}
      </div>

      {/* 2. Weekly Milk Volume Chart (Requirement 1) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Biểu đồ lượng sữa 7 ngày (ml)
          </h3>
          <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
            Đơn vị: ml
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-200/80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4b5563' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#4b5563' }}
                  tickFormatter={(val) => `${val}ml`}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value, name) => [`${value} ml`, name]}
                  contentStyle={{
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: '1px solid #fed7aa',
                    backgroundColor: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar
                  dataKey="Lượng sữa (ml)"
                  fill="#f97316"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
                {hasSolidFood && (
                  <Bar
                    dataKey="Cháo (ml)"
                    fill="#84cc16"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={42}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-xs text-gray-400">
              Chưa có dữ liệu để hiển thị biểu đồ sữa.
            </div>
          )}
        </div>
      </div>

      {/* 3. New Item: Growth Tracking (Weight & Height) (Requirement 2) */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Theo dõi Cân nặng & Chiều cao
              </h3>
              <p className="text-[11px] text-gray-500">
                Nhật ký phát triển thể chất của bé
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenGrowthModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-sm shadow-pink-200 active:scale-95 transition"
          >
            <Plus size={15} />
            <span>Ghi chỉ số mới</span>
          </button>
        </div>

        {/* Latest Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
          <div className="bg-white rounded-2xl p-3 border border-pink-100 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
              <Scale size={14} className="text-pink-500" />
              <span>Cân nặng gần nhất</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-pink-600">
                {latestGrowth?.weight_kg ?? selectedBaby.birth_weight_kg ?? '--'}
              </span>
              <span className="text-xs font-bold text-gray-600">kg</span>
            </div>
            {selectedBaby.birth_weight_kg && latestGrowth?.weight_kg && (
              <p className="text-[10px] text-gray-500 mt-0.5">
                Lúc sinh: {selectedBaby.birth_weight_kg}kg (+
                {(latestGrowth.weight_kg - selectedBaby.birth_weight_kg).toFixed(2)}kg)
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-3 border border-emerald-100 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
              <Ruler size={14} className="text-emerald-500" />
              <span>Chiều cao gần nhất</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-emerald-600">
                {latestGrowth?.height_cm ?? selectedBaby.birth_height_cm ?? '--'}
              </span>
              <span className="text-xs font-bold text-gray-600">cm</span>
            </div>
            {selectedBaby.birth_height_cm && latestGrowth?.height_cm && (
              <p className="text-[10px] text-gray-500 mt-0.5">
                Lúc sinh: {selectedBaby.birth_height_cm}cm (+
                {(latestGrowth.height_cm - selectedBaby.birth_height_cm).toFixed(1)}cm)
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-3 border border-purple-100 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
              <span>👶</span>
              <span>Vòng đầu gần nhất</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-purple-600">
                {latestGrowth?.head_circ_cm ?? '--'}
              </span>
              <span className="text-xs font-bold text-gray-600">cm</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {latestGrowth?.logged_date ? `Đo ngày ${latestGrowth.logged_date}` : 'Chưa có bản ghi'}
            </p>
          </div>
        </div>

        {/* Growth Progression Chart (if >= 2 logs) */}
        {growthChartData.length >= 2 && (
          <div className="bg-white rounded-2xl p-3.5 mb-4 shadow-sm border border-gray-200/80">
            <h4 className="text-xs font-bold text-gray-700 mb-2">
              Biểu đồ tăng trưởng cân nặng & chiều cao
            </h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={growthChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: '1px solid #fce7f3',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Cân nặng (kg)"
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Chiều cao (cm)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Growth Logs List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Lịch sử cân đo</span>
            <span className="text-[11px] text-gray-500 font-medium">
              {growthLogs.length} lần đo
            </span>
          </div>

          {growthLogs.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {growthLogs.map((log) => {
                const [y, m, d] = log.logged_date.split('-').map(Number);
                const displayDate = `${d}/${m}/${y}`;
                return (
                  <div
                    key={log.id}
                    className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50/70 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">
                          {displayDate}
                        </span>
                        {log.notes && (
                          <span className="text-[10px] text-gray-500 italic">
                            ({log.notes})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-medium text-gray-600 mt-0.5">
                        {log.weight_kg && (
                          <span className="text-pink-600 font-bold">
                            ⚖️ {log.weight_kg} kg
                          </span>
                        )}
                        {log.height_cm && (
                          <span className="text-emerald-600 font-bold">
                            📏 {log.height_cm} cm
                          </span>
                        )}
                        {log.head_circ_cm && (
                          <span className="text-purple-600 font-bold">
                            👶 {log.head_circ_cm} cm
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteGrowthLog(log.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Xóa bản ghi"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-gray-400">
              Chưa có bản ghi cân đo nào. Hãy bấm "Ghi chỉ số mới" để bắt đầu theo dõi nhé!
            </div>
          )}
        </div>
      </div>

      {/* Modal: Ghi chỉ số mới (Cân nặng, Chiều cao) */}
      {showGrowthModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-pink-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                <span>⚖️</span>
                <span>Ghi cân nặng & chiều cao</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowGrowthModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGrowthLog} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Ngày cân đo
                </label>
                <input
                  type="date"
                  required
                  value={growthDate}
                  onChange={(e) => setGrowthDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="30"
                    placeholder="VD: 5.6"
                    value={growthWeight}
                    onChange={(e) => setGrowthWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="150"
                    placeholder="VD: 60.5"
                    value={growthHeight}
                    onChange={(e) => setGrowthHeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Vòng đầu (cm - tùy chọn)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="70"
                  placeholder="VD: 39.5"
                  value={growthHead}
                  onChange={(e) => setGrowthHead(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  placeholder="VD: đo tại trạm y tế tiêm chủng"
                  value={growthNotes}
                  onChange={(e) => setGrowthNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGrowthModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={growthSaving || (!growthWeight && !growthHeight && !growthHead)}
                  className="flex-[2] py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-md shadow-pink-200 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Check size={16} />
                  <span>{growthSaving ? 'Đang lưu...' : 'Lưu chỉ số'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
