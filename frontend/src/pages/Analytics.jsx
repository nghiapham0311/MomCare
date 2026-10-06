import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { CalendarDays, Milk, Moon, Baby as DiaperIcon, HeartPulse, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Analytics() {
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailySummary, setDailySummary] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBabies();
  }, []);

  useEffect(() => {
    if (selectedBaby) {
      fetchDailySummary();
      fetchWeeklySummary();
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

  const changeDate = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDateVN = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  const chartData = weeklySummary.map((day) => ({
    name: formatDateVN(day.date),
    'Cho bú': day.feed_count,
    'Giấc ngủ': day.sleep_count,
    'Thay tã': day.diaper_count,
  }));

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
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 sm:pb-8">
      {/* Page Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={20} className="text-pink-500" />
        <h1 className="text-lg font-bold text-gray-800">Thống kê của {selectedBaby.name}</h1>
      </div>

      {/* Baby Selector (if multiple babies) */}
      {babies.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {babies.map((baby) => (
            <button
              key={baby.id}
              onClick={() => setSelectedBaby(baby)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition ${
                selectedBaby?.id === baby.id
                  ? 'bg-pink-500 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {baby.gender === 'girl' ? '👧' : '👶'} {baby.name}
            </button>
          ))}
        </div>
      )}

      {/* Date Navigator */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-pink-100 flex items-center justify-between mb-4">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-xl hover:bg-pink-50 transition active:scale-95"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-pink-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-semibold text-gray-800 border-none bg-transparent focus:outline-none cursor-pointer"
          />
        </div>
        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded-xl hover:bg-pink-50 transition active:scale-95"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Daily Summary Cards */}
      <h3 className="text-sm font-bold text-gray-700 mb-3">Tổng hợp trong ngày</h3>
      {dailySummary ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Milk size={18} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-800">Cho bú</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-700">{dailySummary.feed_count}</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {dailySummary.feed_total_ml > 0 ? `Tổng ${dailySummary.feed_total_ml}ml` : 'lần'}
            </p>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Moon size={18} className="text-indigo-600" />
              <span className="text-xs font-bold text-indigo-800">Giấc ngủ</span>
            </div>
            <p className="text-2xl font-extrabold text-indigo-700">{dailySummary.sleep_count}</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              {dailySummary.sleep_total_minutes > 0
                ? `${Math.round(dailySummary.sleep_total_minutes)} phút`
                : 'giấc'}
            </p>
          </div>

          <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
            <div className="flex items-center gap-2 mb-2">
              <DiaperIcon size={18} className="text-sky-600" />
              <span className="text-xs font-bold text-sky-800">Thay tã</span>
            </div>
            <p className="text-2xl font-extrabold text-sky-700">{dailySummary.diaper_count}</p>
            <p className="text-xs text-sky-600 mt-0.5">lần</p>
          </div>

          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse size={18} className="text-rose-600" />
              <span className="text-xs font-bold text-rose-800">Sức khỏe</span>
            </div>
            <p className="text-2xl font-extrabold text-rose-700">{dailySummary.health_count}</p>
            <p className="text-xs text-rose-600 mt-0.5">ghi nhận</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 text-center text-xs text-gray-400 border border-gray-100 shadow-sm mb-6">
          Chưa có dữ liệu cho ngày này.
        </div>
      )}

      {/* Weekly Chart */}
      <h3 className="text-sm font-bold text-gray-700 mb-3">Biểu đồ 7 ngày gần nhất</h3>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #f3f4f6' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Cho bú" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Giấc ngủ" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Thay tã" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-xs text-gray-400">
            Chưa có dữ liệu để hiển thị biểu đồ.
          </div>
        )}
      </div>
    </div>
  );
}
