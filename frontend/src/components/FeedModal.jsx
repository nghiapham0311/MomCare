import React, { useState, useEffect } from 'react';
import { Milk, X, Plus, Minus, Heart, Check } from 'lucide-react';

export default function FeedModal({ isOpen, onClose, onSave, initialDurationMinutes = null }) {
  const [feedType, setFeedType] = useState('bottle'); // 'bottle' | 'breast'
  const [amountMl, setAmountMl] = useState(120);
  const [milkType, setMilkType] = useState('formula'); // 'formula' | 'breast_milk'
  const [breastSide, setBreastSide] = useState('both'); // 'left' | 'right' | 'both'
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [notes, setNotes] = useState('');

  const quickAmounts = [30, 60, 90, 120, 150, 180, 210, 240];
  const quickDurations = [5, 10, 15, 20, 30];

  useEffect(() => {
    if (initialDurationMinutes) {
      setFeedType('breast');
      setDurationMinutes(initialDurationMinutes);
    }
  }, [initialDurationMinutes]);

  if (!isOpen) return null;

  const handleAdjustAmount = (delta) => {
    setAmountMl((prev) => Math.max(10, Math.min(500, Number(prev || 0) + delta)));
  };

  const handleAdjustDuration = (delta) => {
    setDurationMinutes((prev) => Math.max(1, Math.min(120, Number(prev || 0) + delta)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedType === 'bottle') {
      onSave(
        {
          feed_type: 'bottle',
          milk_type: milkType,
          amount_ml: Number(amountMl) || 0,
        },
        notes
      );
    } else {
      onSave(
        {
          feed_type: 'breast',
          side: breastSide,
          duration_minutes: Number(durationMinutes) || 0,
        },
        notes
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-400 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Milk size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Ghi nhận cữ bú</h3>
              <p className="text-[11px] text-amber-100">Chọn lượng sữa hoặc thời gian bú</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Feed Type Switcher (Bú bình vs Bú mẹ) */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setFeedType('bottle')}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                feedType === 'bottle'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🍼 Bú bình (nhập ml)
            </button>
            <button
              type="button"
              onClick={() => setFeedType('breast')}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                feedType === 'breast'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🤱 Bú mẹ trực tiếp
            </button>
          </div>

          {/* TAB 1: BÚ BÌNH */}
          {feedType === 'bottle' && (
            <div className="space-y-4">
              {/* Milk Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Loại sữa</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMilkType('formula')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                      milkType === 'formula'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>🥛</span> Sữa công thức
                  </button>
                  <button
                    type="button"
                    onClick={() => setMilkType('breast_milk')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                      milkType === 'breast_milk'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>🍼</span> Sữa mẹ vắt
                  </button>
                </div>
              </div>

              {/* Amount In ML - Big Counter */}
              <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 text-center">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Lượng sữa bé bú
                </span>

                <div className="flex items-center justify-center gap-4 my-3">
                  <button
                    type="button"
                    onClick={() => handleAdjustAmount(-10)}
                    className="w-11 h-11 rounded-full bg-white shadow-sm border border-amber-200 flex items-center justify-center text-amber-700 active:scale-95 transition"
                  >
                    <Minus size={20} />
                  </button>

                  <div className="flex items-baseline justify-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="500"
                      step="5"
                      value={amountMl}
                      onChange={(e) => setAmountMl(Math.max(0, Number(e.target.value)))}
                      className="w-24 text-4xl font-extrabold text-amber-600 text-center bg-transparent border-b-2 border-amber-300 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-lg font-bold text-amber-700">ml</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdjustAmount(10)}
                    className="w-11 h-11 rounded-full bg-white shadow-sm border border-amber-200 flex items-center justify-center text-amber-700 active:scale-95 transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmountMl(amt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        amountMl === amt
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {amt}ml
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BÚ MẸ TRỰC TIẾP */}
          {feedType === 'breast' && (
            <div className="space-y-4">
              {/* Side Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bên ngực bé bú</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBreastSide('left')}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                      breastSide === 'left'
                        ? 'border-pink-500 bg-pink-50 text-pink-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    👈 Vú Trái
                  </button>
                  <button
                    type="button"
                    onClick={() => setBreastSide('right')}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                      breastSide === 'right'
                        ? 'border-pink-500 bg-pink-50 text-pink-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    👉 Vú Phải
                  </button>
                  <button
                    type="button"
                    onClick={() => setBreastSide('both')}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                      breastSide === 'both'
                        ? 'border-pink-500 bg-pink-50 text-pink-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ↔️ Cả hai bên
                  </button>
                </div>
              </div>

              {/* Duration Counter */}
              <div className="bg-pink-50/70 border border-pink-200/70 rounded-2xl p-4 text-center">
                <span className="text-xs font-semibold text-pink-800 uppercase tracking-wider">
                  Thời gian bú
                </span>

                <div className="flex items-center justify-center gap-4 my-3">
                  <button
                    type="button"
                    onClick={() => handleAdjustDuration(-5)}
                    className="w-11 h-11 rounded-full bg-white shadow-sm border border-pink-200 flex items-center justify-center text-pink-700 active:scale-95 transition"
                  >
                    <Minus size={20} />
                  </button>

                  <div className="flex items-baseline justify-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                      className="w-20 text-4xl font-extrabold text-pink-600 text-center bg-transparent border-b-2 border-pink-300 focus:outline-none focus:border-pink-500"
                    />
                    <span className="text-lg font-bold text-pink-700">phút</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdjustDuration(5)}
                    className="w-11 h-11 rounded-full bg-white shadow-sm border border-pink-200 flex items-center justify-center text-pink-700 active:scale-95 transition"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Quick Chips */}
                <div className="flex justify-center gap-1.5 mt-2">
                  {quickDurations.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDurationMinutes(dur)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        durationMinutes === dur
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'bg-white border border-pink-200 text-pink-800 hover:bg-pink-100'
                      }`}
                    >
                      {dur}p
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ghi chú thêm (tùy chọn)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: Bé bú ngoan, bú xong ợ hơi tốt..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-200 active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              <Check size={16} /> Lưu cữ bú ({feedType === 'bottle' ? `${amountMl}ml` : `${durationMinutes} phút`})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
