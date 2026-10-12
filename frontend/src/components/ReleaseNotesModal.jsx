import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check } from 'lucide-react';

export const CURRENT_RELEASE_VERSION = 'v1.2.0';
export const RELEASE_STORAGE_KEY = 'momcare_dismissed_release_version';

const RELEASE_NOTES = [
  {
    version: 'v1.2.0',
    date: '12/10/2026',
    title: 'Nâng cấp trải nghiệm 1 tay & Theo dõi toàn diện',
    highlights: [
      {
        emoji: '🥣',
        title: 'Thêm hoạt động Ăn cháo / Ăn dặm',
        desc: 'Ghi nhận nhanh lượng cháo (ml) với các mốc chọn sẵn và ghi chú tình trạng ăn của bé.',
      },
      {
        emoji: '🎯',
        title: 'Nút (+) xòe hình cây quạt dùng 1 tay',
        desc: 'Tích hợp toàn bộ thao tác (Dậy, Bú, Ăn cháo, Ngủ, Tã, Đêm) vào nút (+) giữa màn hình, dễ dàng bấm bằng 1 ngón cái.',
      },
      {
        emoji: '🍼',
        title: 'Tự động tính khoảng cách giữa các cữ ăn',
        desc: 'Thanh timeline tự động tính cữ sau cách cữ trước bao lâu để mẹ canh giờ chuẩn xác.',
      },
      {
        emoji: '🎂',
        title: 'Tự động tính tuần tuổi & Cập nhật hồ sơ bé',
        desc: 'Hiển thị số tuần + ngày tuổi tự động. Bấm vào tên bé để cập nhật tên, ngày tháng năm sinh bất cứ lúc nào.',
      },
      {
        emoji: '📅',
        title: 'Chuẩn hóa lịch ngày hôm nay & giao diện Nap',
        desc: 'Luôn tự động mở đúng ngày hôm nay khi vào app, tinh gọn tiêu đề Nap và tính chính xác WT (Thức) - ST (Ngủ).',
      },
    ],
  },
];

export default function ReleaseNotesModal({ isOpen, onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const dismissed = localStorage.getItem(RELEASE_STORAGE_KEY) === CURRENT_RELEASE_VERSION;
      setDontShowAgain(dismissed ? true : true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem(RELEASE_STORAGE_KEY, CURRENT_RELEASE_VERSION);
    } else {
      localStorage.removeItem(RELEASE_STORAGE_KEY);
    }
    onClose();
  };

  const currentRelease = RELEASE_NOTES[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-in zoom-in-95 duration-150 border border-pink-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 px-5 py-4 text-white relative">
          <button
            type="button"
            onClick={handleConfirm}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
            aria-label="Đóng"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-100 mb-1">
            <Sparkles size={14} />
            <span>Cập nhật phiên bản {currentRelease.version}</span>
          </div>
          <h3 className="text-base font-extrabold leading-snug">
            {currentRelease.title}
          </h3>
        </div>

        {/* Content List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {currentRelease.highlights.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-2.5 rounded-2xl bg-pink-50/50 border border-pink-100/80"
            >
              <span className="text-xl leading-none mt-0.5 flex-shrink-0">
                {item.emoji}
              </span>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-gray-800">
                  {item.title}
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Don't Show Again Checkbox */}
        <div className="px-4 py-3.5 bg-gray-50 border-t border-gray-100 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-600 hover:text-gray-800">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded text-pink-500 border-gray-300 focus:ring-pink-500 cursor-pointer"
            />
            <span>Không hiện lại thông báo này ở lần sau</span>
          </label>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-md shadow-pink-200 active:scale-98 transition flex items-center justify-center gap-1.5"
          >
            <Check size={16} />
            <span>Đã hiểu, bắt đầu sử dụng!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
