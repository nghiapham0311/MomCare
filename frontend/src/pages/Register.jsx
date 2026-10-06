import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, fullName);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng ký thất bại. Email có thể đã được sử dụng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-3xl mx-auto shadow-md mb-3">
            👶
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Tạo tài khoản mới</h2>
          <p className="text-xs text-gray-500 mt-1">Đồng hành cùng bé trong những năm tháng đầu đời</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-xl mb-4 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Họ & Tên</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Mẹ Bím / Bố Bé"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-200 transition duration-200 active:scale-98 disabled:opacity-50 text-sm"
          >
            {loading ? 'Đang tạo...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-pink-600 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
