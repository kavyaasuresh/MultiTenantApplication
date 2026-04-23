import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldCheck, Mail, Lock, Server } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] py-12 px-4 sm:px-6 lg:px-8 font-['Outfit']">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 mb-4">
            <Server className="text-white h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Sign in to TaskMaster
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Enter your credentials to manage your organization
          </p>
        </div>

        <div className="bg-white p-10 rounded-2xl border border-gray-200 shadow-sm">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="text-red-600 text-xs font-semibold text-center bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Username</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="username"
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full btn-primary-saas py-3"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500 font-medium">
          Need a new workspace? {' '}
          <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
            Register Organization
          </Link>
        </p>
      </div>
    </div>
  );
}
