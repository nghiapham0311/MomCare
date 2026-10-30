import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check } from 'lucide-react';

export const CURRENT_RELEASE_VERSION = 'v1.4.3';
export const RELEASE_STORAGE_KEY = 'momcare_dismissed_release_version';

const RELEASE_NOTES = [
  {
    version: 'v1.4.3',
    date: '30/10/2026',
    title: 'Vá lỗi lưu mất dữ liệu khi tải lại & Tối ưu hiển thị giao diện',
    highlights: [
      {
        emoji: '⚡',
        title: 'Khắc phục mất dữ liệu cữ khi tải lại trên điện thoại',
        desc: 'Tự động tải 1.000 cữ mới nhất và ghi nhớ chính xác hồ sơ bé đang chọn cùng ngày xem trong bộ nhớ thiết bị, không lo bị biến mất cữ sau khi reload.',
      },
      {
        emoji: '🎨',
        title: 'Tối ưu Nginx & Làm mới cache giao diện',
        desc: 'Nâng cấp cấu hình Nginx chống lỗi MIME type, nén gzip và làm mới bundle hash đảm bảo giao diện luôn hiển thị đầy đủ màu sắc và kiểu dáng.',
      },
    ],
  },
  {
    version: 'v1.4.1',
    date: '30/10/2026',
    title: 'Vá lỗi giữ ngày khi tải lại trang & Hoàn thiện tính giấc ngủ đêm',
    highlights: [
      {
        emoji: '🔄',
        title: 'Khắc phục lỗi nhảy ngày khi tải lại trang (F5)',
        desc: 'Ghi nhớ ngày bạn đang xem trong phiên làm việc. Khi lưu cữ hoặc bấm F5 reload, app luôn giữ nguyên đúng ngày đang thao tác, không bị nhảy sang ngày hôm sau làm ẩn cữ vừa lưu.',
      },
      {
        emoji: '🌙',
        title: 'Hiển thị giấc ngủ đêm 2 chiều thông minh',
        desc: 'Vừa gán chuẩn xác vào chu kỳ ngày bắt đầu ngủ (hôm trước), vừa tự động hiển thị ngay trên thanh tóm tắt sáng hôm nay khi bé thức dậy, không lo bị trống hay phải lùi ngày để xem.',
      },
      {
        emoji: '⚡',
        title: 'Đồng bộ thao tác cữ Đêm & Nút "Hiện tại"',
        desc: 'Nút "Đêm" trên menu xòe quạt được tự động nhận diện tính giờ ngủ đêm. Nút "Hiện tại" trong form cập nhật đồng thời cả ngày và giờ theo thời gian thực.',
      },
    ],
  },
  {
    version: 'v1.4.0',
    date: '29/10/2026',
    title: 'Tối ưu chu kỳ giấc ngủ đêm & Tinh gọn giao diện',
    highlights: [
      {
        emoji: '🌙',
        title: 'Giấc ngủ đêm gán vào ngày bắt đầu ngủ',
        desc: 'Khi bé thức dậy sáng hôm nay, thời gian ngủ đêm được tính toán chính xác và hiển thị ở ngày hôm trước (ngày bắt đầu ngủ) trên thanh tóm tắt.',
      },
      {
        emoji: '✨',
        title: 'Giao diện danh sách gọn gàng, liền mạch',
        desc: 'Gỡ bỏ banner tím trùng lặp ở giữa danh sách cữ, tập trung toàn bộ thông tin Thức, Ngủ ngày và Ngủ đêm lên thanh tóm tắt trên cùng.',
      },
      {
        emoji: '🇻🇳',
        title: 'Đồng bộ hiển thị Thức & Ngủ trên từng Nap',
        desc: 'Đổi ký hiệu WT thành "Thức" và ST thành "Ngủ" ở từng cữ Nap giúp ba mẹ theo dõi cữ sinh hoạt của con dễ hiểu và trực quan hơn.',
      },
    ],
  },
  {
    version: 'v1.3.0',
    date: '29/10/2026',
    title: 'Thống kê lượng sữa (ml), Cân nặng & Tính giấc ngủ đêm',
    highlights: [
      {
        emoji: '🍼',
        title: 'Thống kê ml sữa của ngày thay vì số lần',
        desc: 'Tổng lượng sữa (ml) hiển thị nổi bật ở thẻ tổng kết và biểu đồ 7 ngày chuyển sang đo lường đơn vị ml trực quan.',
      },
      {
        emoji: '⚖️',
        title: 'Theo dõi Cân nặng & Chiều cao phát triển',
        desc: 'Thêm mục mới trong trang Thống kê giúp theo dõi cân nặng (kg), chiều cao (cm), vòng đầu và vẽ biểu đồ tăng trưởng theo thời gian.',
      },
      {
        emoji: '🌙',
        title: 'Tự động tính thời gian ngủ đêm xuyên ngày',
        desc: 'Tự động tính chính xác thời gian bé ngủ đêm từ lúc bắt đầu ngủ tối hôm trước cho đến lúc thức dậy sáng hôm sau.',
      },
      {
        emoji: '🇻🇳',
        title: 'Đổi WT thành Thức, ST thành Ngủ',
        desc: 'Thay thế các ký tự viết tắt bằng tiếng Việt thân thiện: Thức (thời gian thức) và Ngủ (thời gian ngủ ngày).',
      },
      {
        emoji: '⚡',
        title: 'Mốc chọn nhanh sữa 100ml - 200ml (+10ml)',
        desc: 'Bỏ mốc 90ml, bổ sung đầy đủ dải nút chọn nhanh 100, 110, 120, ..., 200ml phù hợp với sức ăn của bé.',
      },
      {
        emoji: '🎨',
        title: 'Lưu trạng thái Theme Sáng / Tối',
        desc: 'Trạng thái màu nền ghi chú (Sáng / Tối) được lưu tự động trên thiết bị, không bị reset khi tải lại trang.',
      },
    ],
  },
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
        desc: 'Luôn tự động mở đúng ngày hôm nay khi vào app, tinh gọn tiêu đề Nap và tính chính xác thời gian Thức - Ngủ.',
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
