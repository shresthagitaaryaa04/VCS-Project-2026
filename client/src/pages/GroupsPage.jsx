import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, MapPin, Users, Calendar, AlertCircle, Loader, Filter, ChevronDown, X, MessageCircle, UserCheck } from 'lucide-react';
import SEO from '../components/SEO';
import CreateGroupModal from '../components/CreateGroupModal';
import GroupCard from '../components/GroupCard';
import ProfileCard from '../components/ProfileCard';
import { useAuthStore } from '../store/authStore';
import { useAuthGuard } from '../hooks/useAuthGuard';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function GroupsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { canPerformAction } = useAuthGuard();

  // State for groups & friends
  const [groups, setGroups] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const [friendStatuses, setFriendStatuses] = useState({});
  const [userGroups, setUserGroups] = useState([]);
  const [trailsForDropdown, setTrailsForDropdown] = useState([]);

  // Search Users State
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Search My Friends State
  const [myFriendsSearchQuery, setMyFriendsSearchQuery] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'my-groups', 'my-friends', 'friends', 'search-users'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrailFilter, setSelectedTrailFilter] = useState('');
  const [trailFilterQuery, setTrailFilterQuery] = useState('');
  const [showTrailDropdown, setShowTrailDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const trailDropdownRef = useRef(null);

  // Sync activeTab with URL search parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['browse', 'my-groups', 'my-friends', 'friends', 'search-users'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName }, { replace: true });
  };

  // Close trail dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (trailDropdownRef.current && !trailDropdownRef.current.contains(e.target)) {
        setShowTrailDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all groups
  const fetchAllGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/groups/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to fetch groups');

      const data = await response.json();
      setGroups(data.groups || []);
      setError('');
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's groups
  const fetchUserGroups = async () => {
    try {
      const response = await fetch('/api/groups/user/my-groups', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to fetch user groups');

      const data = await response.json();
      setUserGroups(data.groups || []);
    } catch (err) {
      console.error('Error fetching user groups:', err);
    }
  };

  // Fetch logged-in user's accepted friends list
  const fetchMyFriends = async () => {
    try {
      setLoadingFriends(true);
      const res = await axios.get('/api/friends/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        setMyFriends(res.data.friends || []);
      }
    } catch (err) {
      console.error('Error fetching my friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Handle remove friend
  const handleRemoveFriend = async (friendId, friendName) => {
    if (!window.confirm(`Are you sure you want to remove ${friendName || 'this user'} from your friends list?`)) return;

    try {
      const res = await axios.delete(`/api/friends/${friendId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.data.success) {
        setMyFriends(prev => prev.filter(f => (f.userId || f._id) !== friendId));
        toast.success(`Removed ${friendName || 'friend'} from your friends list`, { position: 'bottom-right' });
      }
    } catch (err) {
      console.error('Failed to remove friend:', err);
      toast.error(err.response?.data?.message || 'Failed to remove friend', { position: 'bottom-right' });
    }
  };

  // Fetch suggested friends
  const fetchSuggestedFriends = async () => {
    try {
      const response = await fetch('/api/recommendations/companions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');

      const data = await response.json();
      
      const usersList = Array.isArray(data.companions) ? data.companions 
                      : Array.isArray(data.friends) ? data.friends 
                      : Array.isArray(data) ? data 
                      : [];
                      
      const displayList = usersList.slice(0, 8);
      setSuggestedFriends(displayList);

      if (user && displayList.length > 0) {
        const otherIds = displayList
          .filter(u => String(u._id) !== String(user._id || user.id))
          .map(u => u._id);
          
        if (otherIds.length > 0) {
          try {
            const res = await axios.post('/api/friends/status/batch', { targetUserIds: otherIds }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) {
              setFriendStatuses(res.data.statuses);
            }
          } catch (err) {
            console.error("Failed to fetch batch friend statuses", err);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  // Fetch trails for dropdown
  const fetchTrails = async () => {
    try {
      const response = await fetch('/api/trails/');
      if (!response.ok) throw new Error('Failed to fetch trails');

      const data = await response.json();
      setTrailsForDropdown(data || []);
    } catch (err) {
      console.error('Error fetching trails:', err);
    }
  };

  // Search New Users
  const handleSearchNewUsers = async (e) => {
    e.preventDefault();
    if (!userSearchQuery.trim()) return;

    try {
      setSearchingUsers(true);
      const response = await fetch(`/api/users?search=${encodeURIComponent(userSearchQuery)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to search users');

      const data = await response.json();
      setUserSearchResults(data || []);
      
      if (user && data.length > 0) {
        const otherIds = data
          .filter(u => String(u._id) !== String(user._id || user.id))
          .map(u => u._id);
          
        if (otherIds.length > 0) {
          try {
            const res = await axios.post('/api/friends/status/batch', { targetUserIds: otherIds }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) {
              setFriendStatuses(prev => ({ ...prev, ...res.data.statuses }));
            }
          } catch (err) {
            console.error("Failed to fetch batch friend statuses", err);
          }
        }
      }
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setSearchingUsers(false);
    }
  };

  // Search groups
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      fetchAllGroups();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/groups/search?search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) throw new Error('Failed to search groups');

      const data = await response.json();
      setGroups(data.groups || []);
      setError('');
    } catch (err) {
      console.error('Error searching groups:', err);
      setError('Failed to search groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle create group
  const handleCreateGroup = async (formData) => {
    try {
      setLoading(true);

      const selectedTrail = trailsForDropdown.find(t => (t.name || t.id) === formData.trailName);
      if (!selectedTrail) {
        throw new Error('Selected trail not found');
      }

      const groupData = {
        ...formData,
        trailId: selectedTrail.id || selectedTrail._id
      };

      const response = await fetch('/api/groups/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(groupData)
      });

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch (_) {
          throw new Error(`Server error (${response.status}). Please check the server logs.`);
        }

        if (errorData.code === 'GROUP_CONFLICT') {
          throw errorData;
        }

        throw new Error(errorData.message || 'Failed to create group');
      }

      await response.json();

      setShowCreateModal(false);
      await fetchAllGroups();
      await fetchUserGroups();
      handleTabChange('my-groups');

      setError('');
    } catch (err) {
      console.error('Error creating group:', err);
      if (err.code === 'GROUP_CONFLICT') {
        throw err;
      }
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Are you sure you want to delete ${groupName}? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete group');
      }

      setUserGroups(prevGroups => prevGroups.filter(g => g._id !== groupId));
      setGroups(prevGroups => prevGroups.filter(g => g._id !== groupId));
    } catch (err) {
      console.error('Error deleting group:', err);
      alert(err.message || 'Failed to delete group');
    }
  };

  // Check if current user is member of a group
  const isUserMember = (group) => {
    if (!user || !group) return false;
    const currentUserId = String(user._id || user.id);
    const targetGroupId = String(group._id || group.id);
    if (userGroups.some(ug => String(ug._id || ug.id) === targetGroupId)) return true;
    if (group.members && Array.isArray(group.members)) {
      return group.members.some(m => {
        const mId = m?.userId?._id || m?.userId;
        return mId && String(mId) === currentUserId;
      });
    }
    if (group.creator) {
      const cId = group.creator?._id || group.creator;
      if (cId && String(cId) === currentUserId) return true;
    }
    return false;
  };

  // Handle join group
  const handleJoinGroup = async (groupId) => {
    if (!canPerformAction('join a group')) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join group');
      }

      toast.success(data.message || 'Joined group successfully! 🎉', {
        position: 'bottom-right',
        style: { background: '#1a472a', color: '#fff' }
      });

      await fetchAllGroups();
      await fetchUserGroups();

      setError('');
    } catch (err) {
      console.error('Error joining group:', err);
      toast.error(err.message || 'Failed to join group', { position: 'bottom-right' });
      setError(err.message || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId, userName) => {
    if (!canPerformAction('send friend requests')) return;

    try {
      const response = await axios.post('/api/friends/request', {
        receiverId: userId,
        receiverName: userName
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setFriendStatuses(prev => ({
          ...prev,
          [userId]: 'request_sent'
        }));
        toast.success(`Friend request sent to ${userName || 'trekker'}! 🤝`, { position: 'bottom-right' });
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
      toast.error(error.response?.data?.message || "Failed to send friend request", { position: 'bottom-right' });
    }
  };

  const handleAcceptRequest = async (userId, userName) => {
    if (!canPerformAction('manage friend requests')) return;

    try {
      const response = await axios.post('/api/friends/accept', {
        senderId: userId,
        senderName: userName
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setFriendStatuses(prev => ({
          ...prev,
          [userId]: 'friends'
        }));
        toast.success(`You are now friends with ${userName || 'this trekker'}! 🎉`, {
          position: 'bottom-right',
          style: { background: '#1a472a', color: '#fff' }
        });
        fetchMyFriends();
      }
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      toast.error(error.response?.data?.message || "Failed to accept friend request", { position: 'bottom-right' });
    }
  };

  // Handle open chat for a group
  const handleOpenChat = (conversationId) => {
    if (conversationId) {
      navigate(`/messages/${conversationId}`);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAllGroups();
    fetchUserGroups();
    fetchMyFriends();
    fetchSuggestedFriends();
    fetchTrails();
  }, []);

  // Re-fetch tab specific data when switching tabs
  useEffect(() => {
    if (activeTab === 'my-groups') {
      fetchUserGroups();
    } else if (activeTab === 'my-friends') {
      fetchMyFriends();
    }
  }, [activeTab]);

  // Filtered groups for Browse tab
  const filteredGroups = useMemo(() => {
    const userGroupIds = new Set(userGroups.map(g => g._id));
    let browsableGroups = groups.filter(group => !userGroupIds.has(group._id));

    if (selectedTrailFilter) {
      browsableGroups = browsableGroups.filter(group =>
        (group.trailName || '') === selectedTrailFilter
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      browsableGroups = browsableGroups.filter(group =>
        (group.name || '').toLowerCase().includes(query) ||
        (group.trailName || '').toLowerCase().includes(query) ||
        (group.description || '').toLowerCase().includes(query)
      );
    }

    return browsableGroups;
  }, [groups, userGroups, searchQuery, selectedTrailFilter]);

  // Filtered list for My Friends search
  const filteredMyFriends = useMemo(() => {
    if (!myFriendsSearchQuery.trim()) return myFriends;
    const q = myFriendsSearchQuery.toLowerCase();
    return myFriends.filter(f =>
      (f.name || '').toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q) ||
      (f.province || '').toLowerCase().includes(q)
    );
  }, [myFriends, myFriendsSearchQuery]);

  // Dynamic SEO Metadata
  const seoTitle = useMemo(() => {
    switch (activeTab) {
      case 'my-friends':
        return 'My Friends | Trek Sathi - Himalayan Trekking Companions';
      case 'my-groups':
        return 'My Trekking Groups | Trek Sathi - Nepal Expedition Teams';
      case 'friends':
        return 'Suggested Companions | Trek Sathi - Find Trekking Buddies';
      case 'search-users':
        return 'Search Trekkers | Trek Sathi - Connect with Fellow Adventurers';
      default:
        return 'Explore Groups & Companions | Trek Sathi - Nepal Trekking Community';
    }
  }, [activeTab]);

  const seoDescription = useMemo(() => {
    switch (activeTab) {
      case 'my-friends':
        return 'View and message your accepted trekking friends on Trek Sathi. Coordinate Himalayan expeditions and stay connected.';
      case 'my-groups':
        return 'Manage your active trekking groups in Nepal. Plan itineraries, chat with group members, and prepare for upcoming treks.';
      case 'friends':
        return 'Discover recommended trekking companions matching your preferences and trekking history in Nepal.';
      case 'search-users':
        return 'Find and connect with fellow algorithm-matched trekkers across Nepal by name, email, or province.';
      default:
        return 'Find trekking groups, discover companions, and connect with fellow adventurers exploring Nepal\'s famous trails.';
    }
  }, [activeTab]);

  const structuredData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': seoTitle,
    'description': seoDescription,
    'url': typeof window !== 'undefined' ? window.location.href : '',
    'publisher': {
      '@type': 'Organization',
      'name': 'Trek Sathi',
      'logo': typeof window !== 'undefined' ? `${window.location.origin}/person-simple-hike.svg` : ''
    }
  }), [seoTitle, seoDescription]);

  return (
    <main className="min-h-screen bg-background text-foreground pt-4 transition-colors duration-200" id="groups-main-content">
      {/* 100% SEO Dynamic Component */}
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords="trekking friends Nepal, Himalayan trekking groups, find trek sathi, Annapurna companions, Everest Base Camp buddies"
        canonicalUrl={typeof window !== 'undefined' ? window.location.href : ''}
        structuredData={structuredData}
      />

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Page Header */}
        <header className="mb-6" id="groups-header">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground" id="groups-page-heading">
            Groups & People
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect with Himalayan trekkers, organize expedition teams, and manage your friends list.
          </p>
        </header>

        {/* Navigation Tabs and Action Bar */}
        <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-border" aria-label="Groups and Friends Navigation">
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto" role="tablist" aria-label="Sections">
            <button
              id="tab-browse"
              role="tab"
              aria-selected={activeTab === 'browse'}
              aria-controls="panel-browse"
              onClick={() => handleTabChange('browse')}
              className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap text-sm cursor-pointer ${activeTab === 'browse'
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              Browse Groups
            </button>
            <button
              id="tab-my-groups"
              role="tab"
              aria-selected={activeTab === 'my-groups'}
              aria-controls="panel-my-groups"
              onClick={() => handleTabChange('my-groups')}
              className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap text-sm cursor-pointer ${activeTab === 'my-groups'
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              My Groups {userGroups.length > 0 && `(${userGroups.length})`}
            </button>
            <button
              id="tab-my-friends"
              role="tab"
              aria-selected={activeTab === 'my-friends'}
              aria-controls="panel-my-friends"
              onClick={() => handleTabChange('my-friends')}
              className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap text-sm cursor-pointer flex items-center gap-1.5 ${activeTab === 'my-friends'
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <UserCheck size={16} />
              My Friends {myFriends.length > 0 && `(${myFriends.length})`}
            </button>
            <button
              id="tab-suggested-friends"
              role="tab"
              aria-selected={activeTab === 'friends'}
              aria-controls="panel-suggested-friends"
              onClick={() => handleTabChange('friends')}
              className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap text-sm cursor-pointer ${activeTab === 'friends'
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              Suggested Companions
            </button>
            <button
              id="tab-search-users"
              role="tab"
              aria-selected={activeTab === 'search-users'}
              aria-controls="panel-search-users"
              onClick={() => handleTabChange('search-users')}
              className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap text-sm cursor-pointer ${activeTab === 'search-users'
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              Search Users
            </button>
          </div>
          
          <button
            id="btn-create-group"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold transition duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex-shrink-0 w-full sm:w-auto justify-center cursor-pointer text-sm"
          >
            <Plus size={18} />
            Create Group
          </button>
        </nav>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3" id="groups-error-alert">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
            <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Browse Groups Tab Panel */}
        {activeTab === 'browse' && (
          <section id="panel-browse" role="tabpanel" aria-labelledby="tab-browse">
            {/* Search & Trail Filter */}
            <div className="mb-8 space-y-4">
              <form onSubmit={handleSearch} id="form-search-groups">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    id="search-groups-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search groups by name, trail, or description..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-border bg-card/90 text-foreground hover:border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                    aria-label="Search trekking groups"
                  />
                </div>
              </form>

              {/* Trail Filter Dropdown */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
                  <Filter size={18} />
                  <span className="text-sm font-semibold">Filter by Trail:</span>
                </div>
                <div className="relative flex-1 max-w-md" ref={trailDropdownRef}>
                  <div className="relative">
                    <input
                      id="trail-filter-input"
                      type="text"
                      value={selectedTrailFilter ? selectedTrailFilter : trailFilterQuery}
                      onChange={(e) => {
                        setTrailFilterQuery(e.target.value);
                        setSelectedTrailFilter('');
                        setShowTrailDropdown(true);
                      }}
                      onFocus={() => setShowTrailDropdown(true)}
                      placeholder="Type or select a trail..."
                      className="w-full px-4 py-2.5 pr-20 border-2 border-border hover:border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-card/90 text-foreground text-sm font-medium"
                      aria-label="Filter groups by trail"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {(selectedTrailFilter || trailFilterQuery) && (
                        <button
                          id="btn-clear-trail-filter"
                          onClick={() => {
                            setSelectedTrailFilter('');
                            setTrailFilterQuery('');
                            setShowTrailDropdown(false);
                          }}
                          className="p-1 hover:bg-muted rounded-full transition"
                          aria-label="Clear trail filter"
                        >
                          <X size={14} className="text-muted-foreground" />
                        </button>
                      )}
                      <button
                        id="btn-toggle-trail-dropdown"
                        onClick={() => setShowTrailDropdown(!showTrailDropdown)}
                        className="p-1 hover:bg-muted rounded-full transition"
                        aria-label="Toggle trail dropdown"
                      >
                        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${showTrailDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                  {showTrailDropdown && (
                    <div className="absolute z-50 top-full mt-1 w-full bg-card border-2 border-border rounded-xl shadow-lg max-h-60 overflow-y-auto" id="trail-dropdown-list">
                      <button
                        onClick={() => {
                          setSelectedTrailFilter('');
                          setTrailFilterQuery('');
                          setShowTrailDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 dark:hover:bg-green-950/40 transition ${!selectedTrailFilter ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 font-semibold' : 'text-foreground'
                          }`}
                      >
                        All Trails
                      </button>
                      {trailsForDropdown
                        .filter(trail => {
                          const name = trail.name || trail.id;
                          return !trailFilterQuery || name.toLowerCase().includes(trailFilterQuery.toLowerCase());
                        })
                        .map(trail => {
                          const trailName = trail.name || trail.id;
                          return (
                            <button
                              key={trail._id || trail.id}
                              onClick={() => {
                                setSelectedTrailFilter(trailName);
                                setTrailFilterQuery('');
                                setShowTrailDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 dark:hover:bg-green-950/40 transition ${selectedTrailFilter === trailName ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 font-semibold' : 'text-foreground'
                                }`}
                            >
                              {trailName}
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12" id="browse-groups-loading">
                <Loader className="animate-spin text-green-600 mr-3" size={24} />
                <p className="text-muted-foreground">Loading groups...</p>
              </div>
            )}

            {/* Groups Grid */}
            {!loading && filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="browse-groups-grid">
                {filteredGroups.map(group => (
                  <GroupCard
                    key={group._id || group.id}
                    group={group}
                    onJoin={handleJoinGroup}
                    onOpenChat={handleOpenChat}
                    isMember={isUserMember(group)}
                  />
                ))}
              </div>
            ) : !loading ? (
              <div className="text-center py-12" id="browse-groups-empty">
                <MapPin className="mx-auto text-muted-foreground mb-4" size={48} />
                <h2 className="text-foreground text-lg font-medium">No groups found</h2>
                <p className="text-muted-foreground text-sm">Try a different search or create a new group</p>
              </div>
            ) : null}
          </section>
        )}

        {/* My Groups Tab Panel */}
        {activeTab === 'my-groups' && (
          <section id="panel-my-groups" role="tabpanel" aria-labelledby="tab-my-groups">
            {loading && (
              <div className="flex items-center justify-center py-12" id="my-groups-loading">
                <Loader className="animate-spin text-green-600 mr-3" size={24} />
                <p className="text-muted-foreground">Loading your groups...</p>
              </div>
            )}

            {!loading && userGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="my-groups-grid">
                {userGroups.map(group => (
                  <GroupCard
                    key={group._id}
                    group={group}
                    isMember={true}
                    onOpenChat={handleOpenChat}
                    onDelete={handleDeleteGroup}
                  />
                ))}
              </div>
            ) : !loading ? (
              <div className="text-center py-12" id="my-groups-empty">
                <Users className="mx-auto text-muted-foreground mb-4" size={48} />
                <h2 className="text-foreground text-lg font-medium">You haven't joined any groups yet</h2>
                <p className="text-muted-foreground text-sm">Browse groups and join one to get started</p>
              </div>
            ) : null}
          </section>
        )}

        {/* My Friends Tab Panel */}
        {activeTab === 'my-friends' && (
          <section id="panel-my-friends" role="tabpanel" aria-labelledby="tab-my-friends" className="space-y-6">
            {/* Search Bar for Friends */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                id="search-my-friends-input"
                type="text"
                value={myFriendsSearchQuery}
                onChange={(e) => setMyFriendsSearchQuery(e.target.value)}
                placeholder="Search your friends by name, email, or province..."
                className="w-full pl-12 pr-10 py-3 border-2 border-border bg-card/90 text-foreground hover:border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                aria-label="Search your friends list"
              />
              {myFriendsSearchQuery && (
                <button
                  id="btn-clear-my-friends-search"
                  onClick={() => setMyFriendsSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Clear friends search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Loading State */}
            {loadingFriends && (
              <div className="flex items-center justify-center py-12" id="my-friends-loading">
                <Loader className="animate-spin text-green-600 mr-3" size={24} />
                <p className="text-muted-foreground">Loading your friends list...</p>
              </div>
            )}

            {/* Friends Grid */}
            {!loadingFriends && filteredMyFriends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="my-friends-grid">
                {filteredMyFriends.map(friend => {
                  const friendId = friend.userId || friend._id;
                  const initials = friend.name ? friend.name.charAt(0).toUpperCase() : '?';
                  return (
                    <article
                      key={friendId}
                      id={`friend-card-${friendId}`}
                      className="bg-card rounded-2xl border border-border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3.5 mb-4">
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-inner cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)' }}
                            onClick={() => navigate(`/profile/${friendId}`)}
                          >
                            {friend.avatar || friend.profilePicture ? (
                              <img src={friend.avatar || friend.profilePicture} alt={friend.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white text-xl font-bold">{initials}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-base font-bold text-foreground truncate cursor-pointer hover:text-green-600 transition"
                              onClick={() => navigate(`/profile/${friendId}`)}
                            >
                              {friend.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">{friend.email}</p>
                            {friend.province && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3 text-green-600 shrink-0" />
                                <span className="truncate">{friend.province}, Nepal</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                        <button
                          id={`btn-message-friend-${friendId}`}
                          onClick={() => navigate('/messages')}
                          className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          aria-label={`Send message to ${friend.name}`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </button>
                        <button
                          id={`btn-view-friend-${friendId}`}
                          onClick={() => navigate(`/profile/${friendId}`)}
                          className="py-2 px-3 bg-muted hover:bg-accent text-foreground text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                          aria-label={`View profile of ${friend.name}`}
                        >
                          Profile
                        </button>
                        <button
                          id={`btn-remove-friend-${friendId}`}
                          onClick={() => handleRemoveFriend(friendId, friend.name)}
                          className="py-2 px-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition text-xs cursor-pointer"
                          title="Remove friend"
                          aria-label={`Remove ${friend.name} from friends list`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : !loadingFriends ? (
              <div className="text-center py-16 bg-card/50 rounded-2xl border border-dashed border-border" id="my-friends-empty">
                <Users className="mx-auto text-muted-foreground/60 mb-4" size={56} />
                <h2 className="text-foreground text-lg font-semibold mb-1">No friends found</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                  {myFriendsSearchQuery
                    ? `No friends match "${myFriendsSearchQuery}". Try clearing your search term.`
                    : "You haven't added any trekking friends yet. Explore suggested companions or search users to start connecting!"}
                </p>
                {!myFriendsSearchQuery && (
                  <div className="flex justify-center gap-3">
                    <button
                      id="btn-goto-suggested"
                      onClick={() => handleTabChange('friends')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Suggested Companions
                    </button>
                    <button
                      id="btn-goto-search-users"
                      onClick={() => handleTabChange('search-users')}
                      className="px-4 py-2 bg-muted hover:bg-accent text-foreground rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Search Users
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </section>
        )}

        {/* Suggested Friends Tab Panel */}
        {activeTab === 'friends' && (
          <section id="panel-suggested-friends" role="tabpanel" aria-labelledby="tab-suggested-friends">
            {loading && (
              <div className="flex items-center justify-center py-12" id="suggested-friends-loading">
                <Loader className="animate-spin text-green-600 mr-3" size={24} />
                <p className="text-muted-foreground">Loading suggested companions...</p>
              </div>
            )}

            {!loading && suggestedFriends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="suggested-friends-grid">
                {suggestedFriends.map(friend => (
                  <ProfileCard
                    key={friend._id}
                    user={friend}
                    onClick={() => navigate(`/profile/${friend._id}`)}
                    friendStatus={friendStatuses[friend._id] || 'none'}
                    onAddFriend={handleAddFriend}
                    onAcceptRequest={handleAcceptRequest}
                  />
                ))}
              </div>
            ) : !loading ? (
              <div className="text-center py-12" id="suggested-friends-empty">
                <Users className="mx-auto text-muted-foreground mb-4" size={48} />
                <h2 className="text-foreground text-lg font-medium">No suggested companions available</h2>
              </div>
            ) : null}
          </section>
        )}

        {/* Search Users Tab Panel */}
        {activeTab === 'search-users' && (
          <section id="panel-search-users" role="tabpanel" aria-labelledby="tab-search-users">
            <form onSubmit={handleSearchNewUsers} className="mb-8" id="form-search-users">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  id="search-users-input"
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-12 pr-28 py-3 border-2 border-border bg-card/90 text-foreground hover:border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                  aria-label="Search users by name or email"
                />
                <button 
                  id="btn-submit-search-users"
                  type="submit" 
                  disabled={searchingUsers}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

            {searchingUsers && (
              <div className="flex items-center justify-center py-12" id="search-users-loading">
                <Loader className="animate-spin text-green-600 mr-3" size={24} />
                <p className="text-muted-foreground">Searching users...</p>
              </div>
            )}

            {!searchingUsers && userSearchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="search-users-grid">
                {userSearchResults.map(result => (
                  <ProfileCard
                    key={result._id}
                    user={result}
                    onClick={() => navigate(`/profile/${result._id}`)}
                    friendStatus={friendStatuses[result._id] || 'none'}
                    onAddFriend={handleAddFriend}
                    onAcceptRequest={handleAcceptRequest}
                  />
                ))}
              </div>
            ) : !searchingUsers && userSearchQuery ? (
              <div className="text-center py-12" id="search-users-empty">
                <Users className="mx-auto text-muted-foreground mb-4" size={48} />
                <h2 className="text-foreground text-lg font-medium">No users found</h2>
                <p className="text-muted-foreground text-sm">Try a different search term</p>
              </div>
            ) : null}
          </section>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGroup}
          availableTrails={trailsForDropdown}
        />
      )}
    </main>
  );
}
