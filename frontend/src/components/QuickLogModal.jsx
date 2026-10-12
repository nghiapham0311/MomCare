import React, { useState, useEffect } from 'react';
import { X, Sun, Moon, Milk, Baby as DiaperIcon, Clock, Trash2, Check, Sparkles, UtensilsCrossed } from 'lucide-react';

const getLocalDateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function QuickLogModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialType = 'WAKE',
  activityToEdit = null,
  currentDate = null,
}) {
  const [type, setType] = useState('WAKE');
  const [timeStr, setTimeStr] = useState('08:00');
  const [dateStr, setDateStr] = useState(() => getLocalDateStr());

  // Feed states
  const [feedMode, setFeedMode] = useState('bottle'); // 'bottle' | 'breast'
  const [amountMl, setAmountMl] = useState(130);
  const [breastSide, setBreastSide] = useState('both');

  // Diaper states
  const [diaperStatus, setDiaperStatus] = useState('poop_liquid'); // 'poop_liquid' | 'poop_little' | 'poop_normal' | 'wet'

  // Sleep & Night states
  const [isBedtime, setIsBedtime] = useState(false);
  const [isNight, setIsNight] = useState(false);

  // Common notes
  const [notes, setNotes] = useState('');

  // Quick ML presets from wife's notes: 120, 130, 150, 160, 170, 180, 200
  const milkPresets = [90, 120, 130, 150, 160, 170, 180, 200];
  const feedNotePresets = ['cạn bình', 'bú ngoan', 'nhè bớt', 'bú đc 15p thì ỉa lỏng'];
  const diaperPresets = [
    { label: 'Ỉa lỏng', value: 'poop_liquid' },
    { label: 'Ỉa 1 ít', value: 'poop_little' },
    { label: 'Ỉa bình thường', value: 'poop_normal' },
    { label: 'Tè ướt', value: 'wet' },
  ];
  const nightNotePresets = [
    'dậy hỗ trợ ngủ lại',
    'dậy bú mẹ',
    'dậy chơi',
    'ti giả / vỗ về',
  ];

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;

    if (activityToEdit) {
      if (
        activityToEdit.activity_type === 'NIGHT' ||
        (activityToEdit.activity_type === 'NOTE' && activityToEdit.details?.is_night)
      ) {
        setType('NIGHT');
      } else {
        setType(activityToEdit.activity_type);
      }
      const d = new Date(activityToEdit.start_time);
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
      setDateStr(getLocalDateStr(d));

      if (activityToEdit.details?.amount_ml) {
        setAmountMl(Number(activityToEdit.details.amount_ml));
      }
      if (activityToEdit.details?.feed_type) {
        setFeedMode(activityToEdit.details.feed_type);
      }
      if (activityToEdit.details?.side) {
        setBreastSide(activityToEdit.details.side);
      }
      if (activityToEdit.details?.status) {
        setDiaperStatus(activityToEdit.details.status);
      }
      setIsBedtime(Boolean(activityToEdit.details?.is_bedtime));
      setIsNight(Boolean(activityToEdit.details?.is_night));
      setNotes(activityToEdit.notes || '');
    } else {
      setType(initialType);
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
      setDateStr(currentDate || getLocalDateStr(now));
      setNotes('');
      setIsBedtime(false);
      setIsNight(initialType === 'NIGHT');
      if (initialType === 'SOLID_FOOD') {
        setAmountMl(100);
      } else if (initialType === 'FEED') {
        setAmountMl(130);
      }
    }
  }, [isOpen, activityToEdit, initialType, currentDate]);

  if (!isOpen) return null;

  // Adjust time by minutes
  const adjustTimeByMinutes = (deltaMinutes) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    date.setMinutes(date.getMinutes() + deltaMinutes);
    const newH = String(date.getHours()).padStart(2, '0');
    const newM = String(date.getMinutes()).padStart(2, '0');
    setTimeStr(`${newH}:${newM}`);
  };

  const setTimeToNow = () => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setTimeStr(`${hrs}:${mins}`);
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Construct local Date object to preserve user's local timezone
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const fullDate = new Date(y, m - 1, d, hours, minutes, 0);

    const details = {};

    if (type === 'FEED') {
      details.feed_type = feedMode;
      if (feedMode === 'bottle') {
        details.amount_ml = Number(amountMl) || 0;
      } else {
        details.side = breastSide;
      }
    } else if (type === 'SOLID_FOOD') {
      details.feed_type = 'solid';
      details.amount_ml = Number(amountMl) || 0;
    } else if (type === 'DIAPER') {
      details.status = diaperStatus;
    } else if (type === 'SLEEP') {
      details.is_bedtime = isBedtime;
    }

    if (type === 'NIGHT') {
      details.is_night = true;
    } else {
      delete details.is_night;
    }

    onSave({
      activity_type: type === 'NIGHT' ? 'NIGHT' : type,
      start_time: fullDate.toISOString(),
      details,
      notes: notes.trim(),
      id: activityToEdit?.id,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            {activityToEdit ? '✏️ Chỉnh sửa ghi chú' : '⚡ Ghi nhận nhanh sinh hoạt'}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-200/70 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 overflow-y-auto space-y-4">
          {/* Action Type Selector */}
          {!activityToEdit && (
            <div className="grid grid-cols-6 gap-1.5 p-1 bg-gray-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setType('WAKE')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  type === 'WAKE'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sun size={18} />
                <span>Dậy</span>
              </button>

              <button
                type="button"
                onClick={() => setType('FEED')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  type === 'FEED'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Milk size={18} />
                <span>Bú</span>
              </button>

              <button
                type="button"
                onClick={() => setType('SOLID_FOOD')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  type === 'SOLID_FOOD'
                    ? 'bg-lime-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UtensilsCrossed size={18} />
                <span>Cháo</span>
              </button>

              <button
                type="button"
                onClick={() => setType('SLEEP')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  type === 'SLEEP'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Moon size={18} />
                <span>Ngủ</span>
              </button>

              <button
                type="button"
                onClick={() => setType('DIAPER')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  type === 'DIAPER'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <DiaperIcon size={18} />
                <span>Tã</span>
              </button>

              <button
                type="button"
                onClick={() => setType('NIGHT')}
                className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                  type === 'NIGHT'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles size={18} />
                <span>Đêm</span>
              </button>
            </div>
          )}

          {/* Time Picker Bar */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Clock size={14} className="text-pink-500" />
                Thời gian ghi nhận
              </span>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="text-[11px] font-semibold text-gray-600 bg-transparent border-none p-0 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2.5">
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="text-3xl font-extrabold text-gray-800 bg-white border border-gray-300 rounded-xl px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500 text-center font-mono shadow-inner"
              />
            </div>

            {/* Quick time adjustment chips */}
            <div className="flex flex-wrap justify-center gap-1.5">
              <button
                type="button"
                onClick={setTimeToNow}
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200"
              >
                Hiện tại
              </button>
              <button
                type="button"
                onClick={() => adjustTimeByMinutes(-5)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                -5p
              </button>
              <button
                type="button"
                onClick={() => adjustTimeByMinutes(-10)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                -10p
              </button>
              <button
                type="button"
                onClick={() => adjustTimeByMinutes(-15)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                -15p
              </button>
              <button
                type="button"
                onClick={() => adjustTimeByMinutes(-30)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                -30p
              </button>
            </div>
          </div>

          {/* DẬY (WAKE) */}
          {type === 'WAKE' && (
            <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-3.5 text-center">
              <span className="text-xs font-bold text-amber-800">
                ☀️ Bé thức dậy bắt đầu khoảng thức (WT)
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                Hệ thống sẽ tự động tính thời gian thức đến khi bé ngủ cữ tiếp theo.
              </p>
            </div>
          )}

          {/* BÚ (FEED) */}
          {type === 'FEED' && (
            <div className="space-y-3">
              {/* Feed Mode toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFeedMode('bottle')}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    feedMode === 'bottle'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🍼 Bú bình (ml)
                </button>
                <button
                  type="button"
                  onClick={() => setFeedMode('breast')}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    feedMode === 'breast'
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🤱 Bú mẹ
                </button>
              </div>

              {feedMode === 'bottle' ? (
                <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-orange-900">Lượng sữa (ml)</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="10"
                        max="500"
                        step="5"
                        value={amountMl}
                        onChange={(e) => setAmountMl(Math.max(0, Number(e.target.value)))}
                        className="w-16 text-right font-extrabold text-orange-600 bg-white border border-orange-300 rounded-lg px-2 py-0.5 text-sm focus:outline-none"
                      />
                      <span className="text-xs font-bold text-orange-800">ml</span>
                    </div>
                  </div>

                  {/* Preset chips */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {milkPresets.map((ml) => (
                      <button
                        key={ml}
                        type="button"
                        onClick={() => setAmountMl(ml)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          amountMl === ml
                            ? 'bg-orange-500 text-white shadow'
                            : 'bg-white border border-orange-200 text-orange-800 hover:bg-orange-100'
                        }`}
                      >
                        {ml}ml
                      </button>
                    ))}
                  </div>

                  {/* Quick note chips for feed */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {feedNotePresets.map((fNote) => (
                      <button
                        key={fNote}
                        type="button"
                        onClick={() => setNotes((prev) => (prev ? `${prev}, ${fNote}` : fNote))}
                        className="text-[10px] font-medium bg-white/90 border border-orange-200 text-orange-800 px-2 py-0.5 rounded-full hover:bg-orange-100"
                      >
                        + {fNote}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-pink-50/60 border border-pink-200 rounded-2xl p-3">
                  <span className="text-xs font-bold text-pink-900 block mb-2">Bên ngực bú</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBreastSide('left')}
                      className={`py-2 rounded-xl text-xs font-bold ${
                        breastSide === 'left'
                          ? 'bg-pink-500 text-white'
                          : 'bg-white border border-pink-200 text-pink-800'
                      }`}
                    >
                      Vú Trái
                    </button>
                    <button
                      type="button"
                      onClick={() => setBreastSide('right')}
                      className={`py-2 rounded-xl text-xs font-bold ${
                        breastSide === 'right'
                          ? 'bg-pink-500 text-white'
                          : 'bg-white border border-pink-200 text-pink-800'
                      }`}
                    >
                      Vú Phải
                    </button>
                    <button
                      type="button"
                      onClick={() => setBreastSide('both')}
                      className={`py-2 rounded-xl text-xs font-bold ${
                        breastSide === 'both'
                          ? 'bg-pink-500 text-white'
                          : 'bg-white border border-pink-200 text-pink-800'
                      }`}
                    >
                      Cả 2 bên
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ĂN CHÁO (SOLID_FOOD) */}
          {type === 'SOLID_FOOD' && (
            <div className="bg-lime-50/60 border border-lime-200/80 rounded-2xl p-3.5">
              <span className="text-xs font-bold text-lime-900 block mb-2">🥣 Ăn cháo / Ăn dặm</span>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-lime-800">Lượng (ml)</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="10"
                    max="500"
                    step="5"
                    value={amountMl}
                    onChange={(e) => setAmountMl(Math.max(0, Number(e.target.value)))}
                    className="w-16 text-right font-extrabold text-lime-600 bg-white border border-lime-300 rounded-lg px-2 py-0.5 text-sm focus:outline-none"
                  />
                  <span className="text-xs font-bold text-lime-800">ml</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[30, 50, 80, 100, 120, 150, 180, 200].map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    onClick={() => setAmountMl(ml)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition ${
                      amountMl === ml
                        ? 'bg-lime-600 text-white shadow'
                        : 'bg-white border border-lime-200 text-lime-800 hover:bg-lime-100'
                    }`}
                  >
                    {ml}ml
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-2.5">
                {['ăn ngoan', 'nhè bớt', 'ăn hết', 'không chịu ăn'].map((fNote) => (
                  <button
                    key={fNote}
                    type="button"
                    onClick={() => setNotes((prev) => (prev ? `${prev}, ${fNote}` : fNote))}
                    className="text-[10px] font-medium bg-white/90 border border-lime-200 text-lime-800 px-2 py-0.5 rounded-full hover:bg-lime-100"
                  >
                    + {fNote}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NGỦ (SLEEP) */}
          {type === 'SLEEP' && (
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-indigo-900 block">
                🌙 Bé bắt đầu ngủ (Tính thời gian Nap - ST)
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-950 font-medium">
                <input
                  type="checkbox"
                  checked={isBedtime}
                  onChange={(e) => setIsBedtime(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Đây là giờ vào giấc ngủ đêm (Bedtime)
              </label>
            </div>
          )}

          {/* TÃ (DIAPER) */}
          {type === 'DIAPER' && (
            <div className="bg-sky-50/60 border border-sky-200/80 rounded-2xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-sky-900 block">Tình trạng vệ sinh</span>
              <div className="grid grid-cols-2 gap-2">
                {diaperPresets.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDiaperStatus(d.value)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-left ${
                      diaperStatus === d.value
                        ? 'bg-sky-500 text-white shadow'
                        : 'bg-white border border-sky-200 text-sky-800 hover:bg-sky-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ĐÊM / NOTE */}
          {type === 'NIGHT' && (
            <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-purple-900 block">
                🌙 Hoạt động ban đêm / Hỗ trợ ngủ lại
              </span>
              <div className="flex flex-wrap gap-1.5">
                {nightNotePresets.map((nPreset) => (
                  <button
                    key={nPreset}
                    type="button"
                    onClick={() => setNotes(nPreset)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition ${
                      notes === nPreset
                        ? 'bg-purple-600 text-white border-purple-600 shadow'
                        : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    {nPreset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Ghi chú thêm</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: cạn bình, ỉa lỏng, dậy hỗ trợ ngủ lại..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Bottom Buttons */}
          <div className="flex gap-2 pt-2">
            {activityToEdit && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
                    onDelete(activityToEdit.id);
                    onClose();
                  }
                }}
                className="py-3 px-3.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition flex items-center justify-center text-xs font-bold"
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="flex-[2] py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-md shadow-pink-200 active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              <Check size={16} /> {activityToEdit ? 'Cập nhật' : 'Lưu nhanh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
