import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart2, Heart, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-pink-100 shadow-sm px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-lg shadow">
            👶
          </div>
          <div>
            <h1 className="font-bold text-pink-600 leading-none text-base">MomCare</h1>
            <p className="text-xs text-gray-500">Nhật ký bé yêu</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-6 py-2 flex justify-around items-center shadow-lg sm:hidden">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 text-xs ${
            isActive('/') ? 'text-pink-600 font-bold' : 'text-gray-400'
          }`}
        >
          <Home size={22} />
          <span>Trang chủ</span>
        </Link>

        <Link
          to="/"
          className="flex flex-col items-center justify-center -mt-6 bg-pink-500 text-white rounded-full w-12 h-12 shadow-lg border-4 border-white"
        >
          <PlusCircle size={26} />
        </Link>

        <Link
          to="/analytics"
          className={`flex flex-col items-center gap-0.5 text-xs ${
            isActive('/analytics') ? 'text-pink-600 font-bold' : 'text-gray-400'
          }`}
        >
          <BarChart2 size={22} />
          <span>Thống kê</span>
        </Link>
      </nav>
    </>
  );
}
