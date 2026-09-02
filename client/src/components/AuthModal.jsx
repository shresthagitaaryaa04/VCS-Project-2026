import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, Eye, EyeOff, User, Calendar, MapPin, Phone, Map } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { nepalData } from '../data/nepalData';

const getTodayDateValue = () => new Date().toISOString().slice(0, 10);
const getAgeFromDob = (dobValue) => {
  const birthDate = new Date(dobValue);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

const AuthModal = () => {
  const { isAuthModalOpen, authModalMode, setAuthModal, login, signup, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [gender, setGender] = useState('');

  const resetFields = () => {
    setEmail(''); setPassword(''); setName(''); setDob('');
    setPhone(''); setProvince(''); setDistrict(''); setGender('');
    setFormErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    const today = getTodayDateValue();
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    if (authModalMode === 'signup') {
      if (!name) newErrors.name = 'Full name is required';
      if (!dob) newErrors.dob = 'Date of birth is required';
      else if (dob > today) newErrors.dob = 'Date of birth cannot be in the future';
      else if (getAgeFromDob(dob) < 14) newErrors.dob = 'You must be at least 14 years old to sign up';
      if (!phone) newErrors.phone = 'Phone number is required';
      if (!district) newErrors.district = 'District is required';
      if (!province) newErrors.province = 'Province is required';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, name, dob, phone, province, district, gender);
        setAuthModal(false);
        navigate('/verify-email');
        return;
      }
      setAuthModal(false);
      resetFields();
    } catch (err) {
      // error handled by store
    }
  };

  const switchMode = (mode) => {
    setAuthModal(true, mode);
    setFormErrors({});
  };

  return createPortal(
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          key="auth-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        >
          <div
            className="absolute inset-0 bg-[#111c14]/50 backdrop-blur-sm"
            onClick={() => { setAuthModal(false); resetFields(); }}
          />

          <motion.div
            key="auth-modal-panel"
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div className="flex flex-col items-center px-6 pt-8 pb-4">
              <button
                onClick={() => { setAuthModal(false); resetFields(); }}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img src="/trek sathi logo.png" alt="Trek Sathi" className="h-9 w-auto mb-3" />
              <h2 className="text-xl font-bold text-[#1a472a]">
                {authModalMode === 'login' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-gray-500 text-sm mt-1 text-center">
                {authModalMode === 'login'
                  ? 'Log in to continue your adventure.'
                  : 'Join Trek Sathi to find your next trail.'}
              </p>
            </div>

            {/* Form */}
            <div className="overflow-y-auto px-6 pb-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                {authModalMode === 'signup' && (
                  <Input
                    type="text" id="modal-name" label="Full Name"
                    value={name} onChange={e => { setName(e.target.value); if (formErrors.name) setFormErrors({ ...formErrors, name: undefined }); }}
                    placeholder="John Doe" icon={<User className="w-5 h-5" />} error={formErrors.name}
                  />
                )}

                <Input
                  type="email" id="modal-email" label="Email"
                  value={email} onChange={e => { setEmail(e.target.value); if (formErrors.email) setFormErrors({ ...formErrors, email: undefined }); }}
                  placeholder="your@email.com" icon={<Mail className="w-5 h-5" />} error={formErrors.email}
                />

                {authModalMode === 'signup' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="date" id="modal-dob" label="Date of Birth"
                        value={dob} onChange={e => { setDob(e.target.value); if (formErrors.dob) setFormErrors({ ...formErrors, dob: undefined }); }}
                        max={getTodayDateValue()}
                        icon={<Calendar className="w-5 h-5" />} error={formErrors.dob}
                      />
                      <p className="col-span-2 -mt-1 text-[11px] text-gray-500">
                        You must be at least 14 years old to sign up.
                      </p>
                      <Input
                        type="tel" id="modal-phone" label="Phone"
                        value={phone} onChange={e => { setPhone(e.target.value); if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined }); }}
                        placeholder="+977" icon={<Phone className="w-5 h-5" />} error={formErrors.phone}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Province</label>
                        <select
                          value={province}
                          onChange={e => {
                            setProvince(e.target.value);
                            setDistrict('');
                            if (formErrors.province) setFormErrors({ ...formErrors, province: undefined });
                          }}
                          className={`w-full border ${formErrors.province ? 'border-red-500' : 'border-[#ddd8cc]'} rounded-xl px-3 py-2.5 focus:border-[#40916c] focus:ring-1 focus:ring-[#40916c] outline-none text-sm transition-all bg-white`}
                        >
                          <option value="">Select</option>
                          {['Koshi','Madhesh','Bagmati','Gandaki','Lumbini','Karnali','Sudurpashchim'].map(p => <option key={p}>{p}</option>)}
                        </select>
                        {formErrors.province && <p className="text-xs text-red-500 mt-1">{formErrors.province}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">District</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <select
                            value={district}
                            onChange={e => { setDistrict(e.target.value); if (formErrors.district) setFormErrors({ ...formErrors, district: undefined }); }}
                            className={`w-full border ${formErrors.district ? 'border-red-500' : 'border-[#ddd8cc]'} rounded-xl px-3 py-2.5 pl-10 focus:border-[#40916c] focus:ring-1 focus:ring-[#40916c] outline-none text-sm transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={!province}
                          >
                            <option value="">Select District</option>
                            {province && nepalData[province]?.map((dist) => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>
                        {formErrors.district && <p className="text-xs text-red-500 mt-1">{formErrors.district}</p>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Gender</label>
                      <select value={gender} onChange={e => setGender(e.target.value)}
                        className="w-full border border-[#ddd8cc] rounded-xl px-3 py-2.5 focus:border-[#40916c] focus:ring-1 focus:ring-[#40916c] outline-none text-sm transition-all bg-white">
                        <option value="">Select</option>
                        {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'} id="modal-password" label="Password"
                    value={password} onChange={e => { setPassword(e.target.value); if (formErrors.password) setFormErrors({ ...formErrors, password: undefined }); }}
                    placeholder="••••••••" icon={<Lock className="w-5 h-5" />} error={formErrors.password}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors z-10">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
                )}

                {authModalMode === 'login' && (
                  <div className="flex items-center justify-between text-sm pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[#5a6455]">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#ddd8cc] text-[#1a472a]" />
                      <span>Remember me</span>
                    </label>
                    <Link to="/forgot-password" onClick={() => setAuthModal(false)}
                      className="text-[#1a472a] hover:text-[#15391f] font-medium transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                )}

                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#1a472a] hover:bg-[#15391f] text-white py-3 rounded-xl font-semibold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2">
                  {isLoading
                    ? <><LoadingSpinner size="sm" /><span>{authModalMode === 'login' ? 'Logging in...' : 'Signing up...'}</span></>
                    : authModalMode === 'login' ? 'Log in' : 'Sign up'}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-[#f8f7f2] px-6 py-4 border-t border-[#ddd8cc] text-center">
              <p className="text-[#5a6455] text-sm">
                {authModalMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => switchMode(authModalMode === 'login' ? 'signup' : 'login')}
                  className="text-[#1a472a] font-semibold hover:underline">
                  {authModalMode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
