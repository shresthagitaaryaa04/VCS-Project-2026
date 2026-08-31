import React, { useState, useEffect } from 'react';
import { Menu, X, User, MessageCircle, Home, Compass, Users, LogOut, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import axios from 'axios';
import useChatStore from '../store/useChatStore';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../context/SocketContext';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const { conversations } = useChatStore();
  const { isAuthenticated, logout, pendingRequests, setPendingRequests, incrementPendingRequests, setAuthModal } = useAuthStore();
  const { socket } = useSocket();

  const unreadCount = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchRequests = async () => {
        try {
          const res = await axios.get('/api/friends/requests');
          if (res.data.success) {
            setPendingRequests(res.data.received?.length || 0);
          }
        } catch (error) {
          console.error("Failed to fetch friend requests:", error);
        }
      };
      fetchRequests();
    }
  }, [isAuthenticated, setPendingRequests]);

  useEffect(() => {
    if (!socket) return;
    const handleNewFriendRequest = () => incrementPendingRequests();
    socket.on("new_friend_request", handleNewFriendRequest);
    return () => socket.off("new_friend_request", handleNewFriendRequest);
  }, [socket, incrementPendingRequests]);

  const isActive = (path) =>
    location.pathname === path
      ? 'text-[#1a472a] border-b-2 border-[#40916c]'
      : 'text-gray-600 hover:text-[#1a472a] transition-colors';

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-[#ddd8cc]/50 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/trek sathi logo.png"
              alt="Trek Sathi"
              className="h-9 w-auto object-contain"
            />
            <div className="flex flex-col justify-center">
              <span className="font-extrabold text-xl text-[#111c14] tracking-tight leading-none mb-0.5">
                Trek Sathi
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#5a6455] font-medium tracking-wide uppercase">
                Find your trail. Find your sathi.
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-[15px] font-bold pb-0.5 ${isActive('/')}`}>Home</Link>
            <Link to="/explore" className={`text-[15px] font-bold pb-0.5 ${isActive('/explore')}`}>Explore</Link>

            {isAuthenticated && (
              <>
                <Link to="/groups" className={`text-[15px] font-bold pb-0.5 ${isActive('/groups')}`}>Groups & People</Link>
                <Link to="/messages" className={`text-[15px] font-bold pb-0.5 ${isActive('/messages')} relative`}>
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="relative p-2 rounded-lg text-gray-600 hover:bg-[#f0ece3] hover:text-[#1a472a] transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {pendingRequests > 0 && (
                    <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                <Link to="/profile" className="relative ml-2">
                  <button
                    className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${location.pathname === '/profile'
                      ? 'bg-[#d8f3dc] text-[#1a472a]'
                      : 'text-gray-600 hover:bg-[#f0ece3] hover:text-[#1a472a]'
                      }`}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                </Link>
                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAuthModal(true, 'login')}
                  className="text-sm font-semibold text-[#1a472a] border border-[#1a472a] hover:bg-[#f0ece3] px-4 py-[7px] rounded-lg transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => setAuthModal(true, 'signup')}
                  className="text-sm font-semibold text-white bg-[#1a472a] border border-[#1a472a] hover:bg-[#15391f] px-4 py-[7px] rounded-lg transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-[#1a472a] hover:bg-[#f0ece3] transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-[#ddd8cc] shadow-lg absolute w-full left-0 z-50">
          <div className="px-4 py-4 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-[#1a472a] hover:bg-[#f0ece3]">
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link to="/explore" onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-[#1a472a] hover:bg-[#f0ece3]">
              <Compass className="w-4 h-4" /> Explore
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/groups" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-[#1a472a] hover:bg-[#f0ece3]">
                  <Users className="w-4 h-4" /> Groups & People
                </Link>
                <Link to="/messages" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-[#1a472a] hover:bg-[#f0ece3] justify-between">
                  <div className="flex items-center gap-3"><MessageCircle className="w-4 h-4" /> Messages</div>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </Link>
                <div className="border-t border-[#ddd8cc] my-2 pt-2">
                  <button onClick={() => { setIsOpen(false); setIsNotificationsOpen(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-[#1a472a] hover:bg-[#f0ece3] justify-between">
                    <div className="flex items-center gap-3"><Bell className="w-4 h-4" /> Notifications</div>
                    {pendingRequests > 0 && (
                      <span className="bg-red-500 w-2.5 h-2.5 rounded-full"></span>
                    )}
                  </button>
                  <Link to="/profile" onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-[#1a472a] hover:bg-[#f0ece3] justify-between">
                    <div className="flex items-center gap-3"><User className="w-4 h-4" /> My Profile</div>
                  </Link>
                  <button
                    onClick={async () => { await logout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-[#ddd8cc] my-2 pt-2 space-y-3">
                <button onClick={() => { setIsOpen(false); setAuthModal(true, 'login'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#1a472a] hover:bg-[#f0ece3]">
                  Log in
                </button>
                <button onClick={() => { setIsOpen(false); setAuthModal(true, 'signup'); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#1a472a] hover:bg-[#15391f]">
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Notifications Drawer */}
      {createPortal(
        <AnimatePresence>
          {isNotificationsOpen && (
            <motion.div 
              key="notification-drawer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex justify-end"
            >
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-[#111c14]/40 backdrop-blur-sm" 
                onClick={() => setIsNotificationsOpen(false)} 
              />
              {/* Panel */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-80 max-w-[85vw] bg-white/85 backdrop-blur-xl border-l border-[#ddd8cc]/50 h-full shadow-2xl flex flex-col"
              >
                <div className="p-5 border-b border-[#ddd8cc]/50 flex justify-between items-center">
                  <h2 className="font-bold text-lg text-[#1a472a] flex items-center gap-2">
                    <Bell className="w-5 h-5" /> Notifications
                  </h2>
                  <button onClick={() => setIsNotificationsOpen(false)} className="p-2 rounded-full text-gray-500 hover:text-[#1a472a] hover:bg-[#f0ece3]/50 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {pendingRequests > 0 ? (
                    <div className="group bg-white rounded-xl p-4 border border-[#ddd8cc] shadow-sm hover:border-[#40916c]/50 transition-colors flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#1a472a] flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#40916c]" /> Friend Requests
                        </span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{pendingRequests} new</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        You have {pendingRequests} pending friend request{pendingRequests > 1 ? 's' : ''}. Check your profile to respond.
                      </p>
                      <Link 
                        to="/profile" 
                        onClick={() => setIsNotificationsOpen(false)} 
                        className="mt-2 text-sm font-semibold text-[#1a472a] border border-[#1a472a] py-2 px-4 rounded-lg text-center hover:bg-[#f0ece3] transition-colors"
                      >
                        View Requests
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <div className="w-16 h-16 bg-[#f0ece3] rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-[#a9b0a6]" />
                      </div>
                      <p className="text-[15px] font-medium text-gray-500">You're all caught up!</p>
                      <p className="text-sm mt-1 text-center max-w-[200px]">No new notifications to show right now.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </nav>
  );
};

export default NavBar;