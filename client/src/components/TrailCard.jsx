import React from 'react';
import { Clock, TrendingUp, Star, MapPin, Heart } from 'lucide-react';
import ImageWithFallback from './ImageWithFallBack';

const formatLocation = (location) => {
  if (!location) return 'Nepal';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    const parts = [];
    if (location.provinces?.length > 0) parts.push(location.provinces[0]);
    if (location.districts?.length > 0) parts.push(location.districts[0]);
    if (location.start) parts.push(location.start);
    return parts.length > 0 ? parts.join(', ') : 'Nepal';
  }
  return 'Nepal';
};

const difficultyClass = (d) => {
  if (!d) return 'badge-easy';
  const l = d.toLowerCase();
  if (l === 'easy') return 'badge-easy';
  if (l === 'moderate') return 'badge-moderate';
  return 'badge-challenging';
};

const TrailCard = ({ trail, onClick }) => {
  if (!trail) return null;

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-2xl overflow-hidden group cursor-pointer card-lift border border-border h-full flex flex-col w-full text-foreground transition-colors duration-200"
    >
      {/* Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden shrink-0">
        <ImageWithFallback
          src={trail.image}
          alt={trail.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Difficulty badge */}
        {trail.difficulty && (
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${difficultyClass(trail.difficulty)}`}>
            {trail.difficulty}
          </span>
        )}

        {/* Rating */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm text-foreground">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-[10px] font-bold text-foreground">{trail.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col grow">
        {/* Location eyebrow */}
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="w-3 h-3 text-[#40916c]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {formatLocation(trail.location)}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5 leading-snug group-hover:text-primary transition-colors line-clamp-1">
          {trail.name}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {trail.duration && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
              <Clock className="w-2.5 h-2.5 text-primary" />
              <span className="font-medium">{trail.duration}</span>
            </div>
          )}
          {trail.difficulty && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
              <TrendingUp className="w-2.5 h-2.5 text-orange-400" />
              <span className="capitalize font-medium">{trail.difficulty}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-3 grow">
          {trail.description || 'Experience breathtaking views and diverse landscapes on this trail.'}
        </p>

        {/* Footer CTA */}
        <div className="mt-auto pt-3 border-t border-border flex justify-between items-center">
          <span className="text-xs font-semibold text-primary group-hover:underline">
            View details
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrailCard;