import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-pink-100 overflow-hidden relative">
        {/* Banner For Hải Yến & Ánh Kim with love <3 */}
        <div className="mb-6 -mx-8 -mt-8 py-3 px-4 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white text-center shadow-xs">
          <p className="text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-1.5 drop-shadow-xs">
            <span>✨</span>
            <span>For Hải Yến &amp; Ánh Kim with love ❤️</span>
            <span>✨</span>
          </p>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-3xl mx-auto shadow-md mb-3">
            👶
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Chào mừng trở lại!</h2>
          <p className="text-xs text-gray-500 mt-1">Đăng nhập để theo dõi sinh hoạt của bé</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-xl mb-4 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bo_me@momcare.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
              />
              Ghi nhớ đăng nhập
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-200 transition duration-200 active:scale-98 disabled:opacity-50 text-sm"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-pink-600 font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
