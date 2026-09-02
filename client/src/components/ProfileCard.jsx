import React from 'react';
import { MapPin, Languages, UserPlus, UserCheck, Clock } from 'lucide-react';
import { useAuthGuard } from '../hooks/useAuthGuard';

const ProfileCard = ({
  user,
  onClick,
  showAddButton = true,
  friendStatus = 'none',
  onAddFriend,
  onAcceptRequest
}) => {
  const { canPerformAction } = useAuthGuard();
  if (!user) return null;

  const handleFriendAction = (e) => {
    e.stopPropagation();
    if (!canPerformAction('add or manage friends')) return;
    const userId = user._id || user.id;
    if (friendStatus === 'request_received' && onAcceptRequest) onAcceptRequest(userId, user.name);
    else if (friendStatus === 'none' && onAddFriend) onAddFriend(userId, user.name);
  };

  const getButton = () => {
    switch (friendStatus) {
      case 'friends':
        return { icon: <UserCheck className="w-3.5 h-3.5" />, text: 'Sathi', className: 'bg-primary/15 text-primary cursor-default', disabled: true };
      case 'request_sent':
        return { icon: <Clock className="w-3.5 h-3.5" />, text: 'Request Sent', className: 'bg-muted text-muted-foreground cursor-default', disabled: true };
      case 'request_received':
        return { icon: <UserPlus className="w-3.5 h-3.5" />, text: 'Accept', className: 'bg-secondary text-secondary-foreground hover:bg-primary', disabled: false };
      default:
        return { icon: <UserPlus className="w-3.5 h-3.5" />, text: 'Add Sathi', className: 'bg-primary text-primary-foreground hover:bg-primary-hover', disabled: false };
    }
  };

  const btn = getButton();
  const initials = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-2xl border border-border p-4 card-lift cursor-pointer min-w-[240px] w-full text-foreground transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)' }}>
          {user.profileImage
            ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            : <span className="text-white text-lg font-bold">{initials}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-foreground truncate">{user.name}</h4>
          {(user.age || user.gender) && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {user.age && `${user.age} yrs`}{user.age && user.gender && ' · '}{user.gender}
            </p>
          )}
          {user.province && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-primary" />
              <span className="text-[11px] text-muted-foreground truncate">{user.province}, Nepal</span>
            </div>
          )}
        </div>
      </div>

      {/* Languages */}
      {user.languages?.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <Languages className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground truncate">{user.languages.join(', ')}</span>
        </div>
      )}

      {/* CTA */}
      {showAddButton && (
        <button
          onClick={handleFriendAction}
          disabled={btn.disabled}
          className={`w-full py-2 px-4 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${btn.className}`}
        >
          {btn.icon}
          {btn.text}
        </button>
      )}
    </div>
  );
};

export default ProfileCard;