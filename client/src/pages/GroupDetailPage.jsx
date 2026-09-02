import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Calendar, MessageCircle,
  Trash2, LogOut, UserPlus, Mountain, Loader, AlertCircle,
  Crown
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${id}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load group');
      setGroup(data.group);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/groups/${id}/join`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to join group');
      toast.success('Joined group successfully!', { position: 'bottom-right', style: { background: '#1a472a', color: '#fff' } });
      fetchGroup();
    } catch (err) {
      toast.error(err.message, { position: 'bottom-right' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/groups/${id}/leave`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to leave group');
      toast.success('Left group successfully', { position: 'bottom-right' });
      navigate('/groups');
    } catch (err) {
      toast.error(err.message, { position: 'bottom-right' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete group');
      toast.success('Group deleted successfully', { position: 'bottom-right' });
      navigate('/groups');
    } catch (err) {
      toast.error(err.message, { position: 'bottom-right' });
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleOpenChat = () => {
    if (group?.conversationId) navigate(`/messages/${group.conversationId}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Loader className="animate-spin text-green-600 mr-3" size={32} />
      <p className="text-gray-600 text-lg">Loading group...</p>
    </div>
  );

  if (error || !group) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 gap-4">
      <AlertCircle size={48} className="text-red-400" />
      <p className="text-gray-700 text-lg">{error || 'Group not found'}</p>
      <button onClick={() => navigate('/groups')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        Back to Groups
      </button>
    </div>
  );

  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-800',
    'Easy to Moderate': 'bg-teal-100 text-teal-800',
    'Moderate': 'bg-yellow-100 text-yellow-800',
    'Challenging': 'bg-orange-100 text-orange-800',
    'Difficult': 'bg-red-100 text-red-800',
    'Very Difficult': 'bg-red-200 text-red-900',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-6 pb-16">
      <div className="max-w-4xl mx-auto px-4">

        {/* Back Button */}
        <button
          onClick={() => navigate('/groups')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Groups</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                {group.difficulty && (
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${difficultyColors[group.difficulty] || 'bg-gray-100 text-gray-800'}`}>
                    {group.difficulty}
                  </span>
                )}
                <h1 className="text-2xl font-bold text-white mb-1">{group.name}</h1>
                <p className="text-green-100 text-sm">
                  Organized by {typeof group.creator === 'object' ? group.creator?.name : 'Unknown'}
                </p>
              </div>
              <div>
                {group.isFull ? (
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">FULL</span>
                ) : (
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {group.maxMembers - group.memberCount} spots left
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 divide-x border-t border-gray-100">
            <div className="flex items-center gap-3 p-4">
              <Mountain size={18} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Trail</p>
                <p className="font-semibold text-gray-900 text-sm">{group.trailName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Calendar size={18} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Trek Date</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {group.trekDate ? new Date(group.trekDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Users size={18} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Members</p>
                <p className="font-semibold text-gray-900 text-sm">{group.memberCount}/{group.maxMembers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: About + Actions */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About This Group</h2>
              <p className="text-gray-600 leading-relaxed">{group.description}</p>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {group.isMember && (
                  <button
                    onClick={handleOpenChat}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    <MessageCircle size={18} />
                    Open Group Chat
                  </button>
                )}
                {!group.isMember && !group.isFull && (
                  <button
                    onClick={handleJoin}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <UserPlus size={18} />
                    {actionLoading ? 'Joining...' : 'Join Group'}
                  </button>
                )}
                {group.isMember && !group.isCreator && (
                  <button
                    onClick={handleLeave}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    <LogOut size={18} />
                    {actionLoading ? 'Leaving...' : 'Leave Group'}
                  </button>
                )}
                {group.isCreator && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                    Delete Group
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Members */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Members ({group.memberCount}/{group.maxMembers})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {(group.members || []).map((m, i) => {
                const memberUser = m.userId && typeof m.userId === 'object' ? m.userId : { name: 'Member', _id: m.userId };
                const isCreator = String(memberUser._id) === String(group.creator?._id || group.creator);
                return (
                  <div key={i} className="flex items-center gap-3">
                    {memberUser.profilePicture ? (
                      <img src={memberUser.profilePicture} alt={memberUser.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(memberUser.name || 'M')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{memberUser.name || 'Member'}</p>
                    </div>
                    {isCreator && (
                      <Crown size={14} className="text-yellow-500 flex-shrink-0" title="Group Creator" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Group?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{group.name}</strong>? This will also remove the group chat. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
