import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, UserPlus, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [tenantName, setTenantName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register-tenant', {
        tenantName,
        adminUsername,
        adminPassword
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] py-12 px-4 sm:px-6 lg:px-8 font-['Outfit']">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 mb-4">
            <Building2 className="text-white h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Register Organization
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Create a new tenant workspace for your team
          </p>
        </div>

        <div className="bg-white p-10 rounded-2xl border border-gray-200 shadow-sm">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="text-red-600 text-xs font-semibold text-center bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Organization Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Acme Corp"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Admin Username</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="admin_user"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full btn-primary-saas py-3"
              >
                Register Tenant
              </button>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
          <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
