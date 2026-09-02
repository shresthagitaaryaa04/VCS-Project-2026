import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Mountain, Map, Users, Footprints } from 'lucide-react';
import TrailCard from '../components/TrailCard';
import ProfileCard from '../components/ProfileCard';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useAuthGuard } from '../hooks/useAuthGuard';

const HomePage = ({ userName = "Traveler" }) => {
  const navigate = useNavigate();
  const { user: authUser, setAuthModal } = useAuthStore();
  const { canPerformAction } = useAuthGuard();
  const friendScrollRef = useRef(null);
  const popularScrollRef = useRef(null);

  const [recTrails, setRecTrails] = useState([]);
  const [companions, setCompanions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendStatuses, setFriendStatuses] = useState({});

  const scroll = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' });
    }
  };

  const recommendedTrails = recTrails.slice(0, 13);
  const popularTrails = recTrails.slice(13);

  const recommendedFriends = companions.filter(user => {
    if (!authUser) return true;
    const currentUserId = String(authUser._id || authUser.id);
    const targetUserId = String(user._id || user.id);
    if (currentUserId === targetUserId) return false;
    const status = friendStatuses[targetUserId];
    if (status === 'friends') return false;
    return true;
  });

  const handleAddFriend = async (userId, userName) => {
    if (!canPerformAction('send friend requests')) return;
    try {
      const response = await axios.post('/api/friends/request', { receiverId: userId, receiverName: userName });
      if (response.data.success) {
        setFriendStatuses(prev => ({ ...prev, [userId]: 'request_sent' }));
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
      alert(error.response?.data?.message || "Failed to send friend request");
    }
  };

  const handleAcceptRequest = async (userId, userName) => {
    if (!canPerformAction('manage friend requests')) return;
    try {
      const response = await axios.post('/api/friends/accept', { senderId: userId, senderName: userName });
      if (response.data.success) {
        setFriendStatuses(prev => ({ ...prev, [userId]: 'friends' }));
      }
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      alert("Failed to accept friend request");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let trailList = [], userList = [];

        if (authUser) {
          const [trailsResult, companionsResult] = await Promise.allSettled([
            axios.get('/api/recommendations/trails'),
            axios.get('/api/recommendations/companions'),
          ]);
          if (trailsResult.status === 'fulfilled') trailList = trailsResult.value.data.trails || [];
          else { console.error('Rec trails fetch failed:', trailsResult.reason); setError('Failed to load trails. Please try again.'); }
          if (companionsResult.status === 'fulfilled') {
            userList = (companionsResult.value.data.companions || []).map(u => ({
              ...u, _id: u._id || u.id, id: u._id || u.id, name: u.name || 'Trekker', province: u.province || 'Nepal', district: u.district || 'Unknown',
            }));
          } else console.error('Companions fetch failed:', companionsResult.reason);
        } else {
          const [trailsResult, usersResult] = await Promise.allSettled([
            axios.get('/api/trails'),
            axios.get('/api/users'),
          ]);
          if (trailsResult.status === 'fulfilled') trailList = trailsResult.value.data || [];
          else { console.error('Trails fetch failed:', trailsResult.reason); setError('Failed to load trails. Please try again.'); }
          if (usersResult.status === 'fulfilled') {
            userList = (usersResult.value.data || []).map(u => ({
              ...u, _id: u._id || u.id, id: u._id || u.id, name: u.name || 'Trekker', province: u.province || 'Nepal', district: u.district || 'Unknown',
            }));
          } else console.error('Users fetch failed:', usersResult.reason);
        }

        const withCachedImages = trailList.map(t => {
          try {
            const cachedImages = JSON.parse(localStorage.getItem('trail_images_cache') || '{}');
            if (cachedImages[t._id || t.id]) return { ...t, image: cachedImages[t._id || t.id] };
          } catch (e) { /* ignore */ }
          return t;
        });
        setRecTrails(withCachedImages);

        if (withCachedImages.length > 0) {
          const trailIds = withCachedImages.map(t => t._id || t.id);
          axios.post('/api/trails/batch-images', { ids: trailIds })
            .then(imgResp => {
              const imagesMap = imgResp.data;
              try {
                const currentCache = JSON.parse(localStorage.getItem('trail_images_cache') || '{}');
                localStorage.setItem('trail_images_cache', JSON.stringify({ ...currentCache, ...imagesMap }));
              } catch (e) { /* ignore */ }
              setRecTrails(prev => prev.map(t => {
                const newImage = imagesMap[String(t._id || t.id)];
                return newImage ? { ...t, image: newImage } : t;
              }));
            })
            .catch(e => console.error('Background image fetch failed', e));
        }

        setCompanions(userList);

        if (authUser && userList.length > 0) {
          const otherIds = userList
            .filter(u => String(u._id) !== String(authUser._id || authUser.id))
            .map(u => u._id);
          if (otherIds.length > 0) {
            try {
              const res = await axios.post('/api/friends/status/batch', { targetUserIds: otherIds });
              if (res.data.success) setFriendStatuses(res.data.statuses);
            } catch (err) { console.error("Failed to fetch batch friend statuses", err); }
          }
        }
      } catch (err) {
        console.error('Unexpected error in fetchData:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f2]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-[#1a472a] border-t-transparent mb-4"></div>
          <p className="text-sm text-[#5a6455] font-medium">Loading trails and trekkers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f2]">
        <div className="text-center max-w-md">
          <p className="text-red-500 font-semibold mb-2">Error loading data</p>
          <p className="text-sm text-[#5a6455]">{error}</p>
          <p className="text-xs text-gray-400 mt-4">Make sure the backend server is running on port 5000</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero ── */}
      <div className="p-4 sm:p-6 lg:p-8 bg-[#f8f7f2]">
        <section className="relative min-h-[58vh] sm:min-h-[78vh] flex items-center overflow-hidden rounded-[1.5rem] sm:rounded-[3rem] shadow-xl">
          {/* Background image */}
          <div className="absolute inset-0">
          <img
            src="/Desktop-hero.jpg"
            alt="Nepal Mountains"
            className="hidden sm:block w-full h-full object-cover object-center"
          />
          <img
            src="/Mobile-hero.jpg"
            alt="Nepal Mountains"
            className="block sm:hidden w-full h-full object-cover object-center"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f14]/70 via-[#0a1f14]/60 to-[#0a1f14]/85" />
        </div>

        {/* Hero Content */}
        <div className="relative w-full px-4 sm:px-8 lg:px-16 py-14 sm:py-20 animate-up">
          <div className="max-w-2xl">
            {/* Eyebrow pill */}
            <div className="pill-badge mb-4 sm:mb-6 text-[0.62rem] sm:text-[0.72rem]">
              <Mountain className="w-3.5 h-3.5" /> Nepal Trekking Community
            </div>

            {/* Stacked heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-2">
              Find your <span className="text-[#74c69d]">trail.</span>
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Find your <span className="text-[#74c69d]">sathi.</span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-lg mb-8 leading-relaxed">
              Discover Nepal's best hikes, find companions who match your pace, and plan safer group adventures.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-10">
              <button
                onClick={() => navigate('/explore')}
                className="px-6 py-3 bg-[#40916c] hover:bg-[#2d6a4f] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl text-sm w-full sm:w-auto"
              >
                Explore trails
              </button>
              {!authUser && (
                <button
                  onClick={() => setAuthModal(true, 'signup')}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/25 backdrop-blur-sm transition-all text-sm w-full sm:w-auto"
                >
                  Create your profile
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* ── Recommended Trails ── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 space-y-14 bg-[#f8f7f2]">
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="eyebrow">Personalized</span>
              <h2 className="text-2xl font-bold text-[#111c14] mt-1">Recommended for you</h2>
              <p className="text-[#5a6455] text-sm mt-0.5">Trails matched to your interests and experience.</p>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="text-sm font-semibold text-[#1a472a] hover:underline hidden sm:block"
            >
              View all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendedTrails.map((trail) => (
              <div key={trail.id} className="h-full">
                <TrailCard trail={trail} onClick={() => navigate(`/trail/${trail.id}`)} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Find Trekking Partners ── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="eyebrow">Social</span>
              <h2 className="text-2xl font-bold text-[#111c14] mt-1">Find trekking partners</h2>
              <p className="text-[#5a6455] text-sm mt-0.5">Connect with people who share your pace and interests.</p>
            </div>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scroll(friendScrollRef, 'left')}
                className="p-2 rounded-full bg-white border border-[#ddd8cc] hover:bg-[#f0ece3] transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 text-[#111c14]" />
              </button>
              <button
                onClick={() => scroll(friendScrollRef, 'right')}
                className="p-2 rounded-full bg-white border border-[#ddd8cc] hover:bg-[#f0ece3] transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4 text-[#111c14]" />
              </button>
            </div>
          </div>

          <div
            ref={friendScrollRef}
            className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x snap-mandatory"
          >
            {recommendedFriends.map((user) => (
              <div key={user._id} className="w-[240px] sm:w-[280px] shrink-0 snap-start">
                <ProfileCard
                  user={user}
                  onClick={() => navigate(`/profile/${user._id}`)}
                  friendStatus={friendStatuses[user._id] || 'none'}
                  onAddFriend={handleAddFriend}
                  onAcceptRequest={handleAcceptRequest}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Popular Trails ── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="eyebrow">Explore</span>
              <h2 className="text-2xl font-bold text-[#111c14] mt-1">Popular trails</h2>
              <p className="text-[#5a6455] text-sm mt-0.5">
                {popularTrails.length} more destinations to discover.
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scroll(popularScrollRef, 'left')}
                className="p-2 rounded-full bg-white border border-[#ddd8cc] hover:bg-[#f0ece3] transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 text-[#111c14]" />
              </button>
              <button
                onClick={() => scroll(popularScrollRef, 'right')}
                className="p-2 rounded-full bg-white border border-[#ddd8cc] hover:bg-[#f0ece3] transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4 text-[#111c14]" />
              </button>
            </div>
          </div>

          <div
            ref={popularScrollRef}
            className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x snap-mandatory"
          >
            {popularTrails.map((trail) => (
              <div key={trail.id} className="w-[280px] sm:w-[320px] shrink-0 snap-center h-full">
                <TrailCard trail={trail} onClick={() => navigate(`/trail/${trail.id}`)} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature Banner ── */}
        <section>
          <div className="rounded-2xl bg-[#0a1f14] text-white p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-lg">
              <span className="eyebrow text-[#74c69d] mb-3 block">Plan Together</span>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Not sure where to start?</h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Set your hiking preferences and Trek Sathi will rank trails and companions around your style, budget and dates.
              </p>
              <button
                onClick={() => navigate('/preferences')}
                className="px-5 py-2.5 bg-[#40916c] hover:bg-[#2d6a4f] text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Tune my preferences
              </button>
            </div>
            <div className="hidden md:flex gap-5 text-[#74c69d] opacity-80">
              <Footprints className="w-12 h-12" />
              <Map className="w-12 h-12" />
              <Users className="w-12 h-12" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;