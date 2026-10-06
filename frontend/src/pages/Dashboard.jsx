import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TimerWidget from '../components/TimerWidget';
import FeedModal from '../components/FeedModal';
import { Milk, Moon, Sun, Baby as DiaperIcon, HeartPulse, Plus, Clock, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBabyModal, setShowBabyModal] = useState(false);
  const [showFeedModal, setShowFeedModal] = useState(false);
  const [feedDurationInitial, setFeedDurationInitial] = useState(null);
  // New baby form state
  const [babyName, setBabyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('boy');

  useEffect(() => {
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
        setShowBabyModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (babyId) => {
    try {
      const res = await api.get(`/activities/?baby_id=${babyId}`);
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBaby = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/babies/', {
        name: babyName,
        birth_date: birthDate,
        gender: gender,
      });
      setBabies([...babies, res.data]);
      setSelectedBaby(res.data);
      setShowBabyModal(false);
      setBabyName('');
      setBirthDate('');
    } catch (err) {
      console.error(err);
    }
  };

  const logQuickActivity = async (type, details = {}) => {
    if (!selectedBaby) return;
    try {
      const res = await api.post('/activities/', {
        baby_id: selectedBaby.id,
        activity_type: type,
        details: details,
      });
      setActivities([res.data, ...activities]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedSave = async (feedDetails, notes = '') => {
    if (!selectedBaby) return;
    try {
      const res = await api.post('/activities/', {
        baby_id: selectedBaby.id,
        activity_type: 'FEED',
        details: feedDetails,
        notes: notes,
      });
      setActivities([res.data, ...activities]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await api.delete(`/activities/${id}`);
      setActivities(activities.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24 sm:pb-8">
      {/* Baby Switcher / Info Header */}
      {selectedBaby ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100 flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-2xl">
              {selectedBaby.gender === 'girl' ? '👧' : '👶'}
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg leading-tight">{selectedBaby.name}</h2>
              <p className="text-xs text-gray-500">
                Sinh ngày: {new Date(selectedBaby.birth_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBabyModal(true)}
            className="text-xs bg-pink-50 text-pink-600 font-semibold px-3 py-1.5 rounded-full hover:bg-pink-100 transition"
          >
            + Thêm bé
          </button>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-3">Chưa có thông tin bé nào. Vui lòng thêm bé để bắt đầu!</p>
          <button
            onClick={() => setShowBabyModal(true)}
            className="bg-pink-500 text-white font-bold px-6 py-2.5 rounded-full text-sm shadow"
          >
            + Tạo hồ sơ cho bé
          </button>
        </div>
      )}

      {/* Stopwatch Timer Widget */}
      {selectedBaby && (
        <TimerWidget
          title="Bấm giờ cữ bú / ngủ"
          onSave={(sec) => {
            const mins = Math.max(1, Math.round(sec / 60));
            setFeedDurationInitial(mins);
            setShowFeedModal(true);
          }}
        />
      )}

      {/* Touch-Friendly 1-Tap Quick Logging Section */}
      <h3 className="text-sm font-bold text-gray-700 mb-3 mt-4 flex items-center gap-1.5">
        <Clock size={16} className="text-pink-500" />
        Ghi nhanh sinh hoạt (1 chạm)
      </h3>

      <div className="grid grid-cols-4 gap-2 mb-6">
        <button
          onClick={() => {
            setFeedDurationInitial(null);
            setShowFeedModal(true);
          }}
          className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition"
        >
          <Milk size={26} className="text-amber-600" />
          <span className="text-xs font-bold">Cho bú</span>
          <span className="text-[10px] text-amber-600 font-medium">Nhập ml sữa</span>
        </button>

        <button
          onClick={() => logQuickActivity('SLEEP', { type: 'nap' })}
          className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition"
        >
          <Moon size={26} className="text-indigo-600" />
          <span className="text-xs font-bold">Đi ngủ</span>
          <span className="text-[10px] text-indigo-600 font-medium">Giấc ngủ</span>
        </button>

        <button
          onClick={() => logQuickActivity('DIAPER', { status: 'wet' })}
          className="bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition"
        >
          <DiaperIcon size={26} className="text-sky-600" />
          <span className="text-xs font-bold">Thay tã</span>
          <span className="text-[10px] text-sky-600 font-medium">Tã ướt</span>
        </button>

        <button
          onClick={() => logQuickActivity('HEALTH', { note: 'Đo nhiệt độ' })}
          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-sm active:scale-95 transition"
        >
          <HeartPulse size={26} className="text-rose-600" />
          <span className="text-xs font-bold">Sức khỏe</span>
          <span className="text-[10px] text-rose-600 font-medium">Nhiệt độ</span>
        </button>
      </div>

      {/* Activity Timeline List */}
      <h3 className="text-sm font-bold text-gray-700 mb-3">Nhật ký hôm nay</h3>

      {activities.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-xs text-gray-400 border border-gray-100 shadow-sm">
          Chưa có nhật ký nào hôm nay. Hãy chạm vào các nút trên để ghi lại!
        </div>
      ) : (
        <div className="space-y-2.5">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-lg">
                  {act.activity_type === 'FEED' && '🍼'}
                  {act.activity_type === 'SLEEP' && '🌙'}
                  {act.activity_type === 'DIAPER' && '👶'}
                  {act.activity_type === 'HEALTH' && '💊'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-800">
                      {act.activity_type === 'FEED' &&
                        (act.details?.feed_type === 'breast' ? 'Bú mẹ trực tiếp' : 'Cho bé bú bình')}
                      {act.activity_type === 'SLEEP' && 'Bé đi ngủ'}
                      {act.activity_type === 'DIAPER' && 'Thay tã'}
                      {act.activity_type === 'HEALTH' && 'Theo dõi sức khỏe'}
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">
                      {new Date(act.start_time).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {act.details?.amount_ml ? `${act.details.amount_ml}ml ` : ''}
                    {act.details?.milk_type === 'formula' && '(sữa công thức) '}
                    {act.details?.milk_type === 'breast_milk' && '(sữa mẹ) '}
                    {act.details?.side === 'left' && 'vú trái '}
                    {act.details?.side === 'right' && 'vú phải '}
                    {act.details?.side === 'both' && 'cả 2 bên '}
                    {act.details?.duration_minutes ? `${act.details.duration_minutes} phút ` : ''}
                    {act.details?.status === 'wet' && 'Tã ướt '}
                    {act.notes ? `• ${act.notes}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteActivity(act.id)}
                className="text-gray-300 hover:text-rose-500 p-1 transition"
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal create baby */}
      {showBabyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tạo hồ sơ cho bé</h3>
            <form onSubmit={handleCreateBaby} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tên của bé</label>
                <input
                  type="text"
                  required
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="Ví dụ: Bé Bơ, Bé Gạo"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày sinh</label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Giới tính</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                >
                  <option value="boy">Bé Trai 👦</option>
                  <option value="girl">Bé Gái 👧</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                {babies.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowBabyModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border text-xs font-semibold text-gray-600"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-pink-500 text-white text-xs font-bold shadow"
                >
                  Lưu thông tin bé
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Log Feeding (with ml amount input) */}
      <FeedModal
        isOpen={showFeedModal}
        onClose={() => {
          setShowFeedModal(false);
          setFeedDurationInitial(null);
        }}
        onSave={handleFeedSave}
        initialDurationMinutes={feedDurationInitial}
      />
    </div>
  );
}
