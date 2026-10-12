import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReleaseNotesModal, {
  CURRENT_RELEASE_VERSION,
  RELEASE_STORAGE_KEY,
} from './ReleaseNotesModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);

  useEffect(() => {
    if (user) {
      const dismissedVersion = localStorage.getItem(RELEASE_STORAGE_KEY);
      if (dismissedVersion !== CURRENT_RELEASE_VERSION) {
        setShowReleaseNotes(true);
      }
    }
  }, [user]);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-pink-100 shadow-sm px-4 py-2.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-lg shadow">
            👶
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-pink-600 leading-none text-base">MomCare</h1>
              <button
                type="button"
                onClick={() => setShowReleaseNotes(true)}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 text-[10px] font-bold transition"
                title="Xem thông tin cập nhật phiên bản mới"
              >
                <Sparkles size={10} />
                <span>{CURRENT_RELEASE_VERSION}</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-500">Nhật ký bé yêu</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-1 mr-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                isActive('/')
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/analytics"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                isActive('/analytics')
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Thống kê
            </Link>
          </div>

          <span className="text-xs font-medium text-gray-600 hidden sm:inline">
            {user.full_name || user.email}
          </span>
          <button
            onClick={logout}
            className="p-1.5 text-gray-500 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition"
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Bottom Mobile Navigation Bar (3 equal columns so center + FAB aligns symmetrically) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-2 grid grid-cols-3 items-center shadow-lg sm:hidden">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] ${
            isActive('/') ? 'text-pink-600 font-bold' : 'text-gray-400'
          }`}
        >
          <Home size={20} />
          <span>Trang chủ</span>
        </Link>

        {/* Center slot reserved for the floating + button */}
        <div className="flex items-center justify-center h-9 pointer-events-none" />

        <Link
          to="/analytics"
          className={`flex flex-col items-center justify-center gap-0.5 text-[11px] ${
            isActive('/analytics') ? 'text-pink-600 font-bold' : 'text-gray-400'
          }`}
        >
          <BarChart2 size={20} />
          <span>Thống kê</span>
        </Link>
      </nav>

      {/* Release Notes Modal */}
      <ReleaseNotesModal
        isOpen={showReleaseNotes}
        onClose={() => setShowReleaseNotes(false)}
      />
    </>
  );
}
