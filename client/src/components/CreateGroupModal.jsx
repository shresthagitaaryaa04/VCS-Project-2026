import { useState, useRef, useEffect } from 'react';
import { X, MapPin, Calendar, Users, AlertCircle, Mountain, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FieldError = ({ field, errors, touched }) => (
  errors[field] && touched[field] ? (
    <p className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
      <AlertCircle size={12} /> {errors[field]}
    </p>
  ) : null
);

export default function CreateGroupModal({ onClose, preselectedTrail = '', availableTrails = [], onSubmit }) {
  const [formData, setFormData] = useState({
    trailName: typeof preselectedTrail === 'string' ? preselectedTrail : (preselectedTrail?.name || ''),
    name: '',
    description: '',
    trekDate: '',
    maxMembers: '15',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [trailSearch, setTrailSearch] = useState('');
  const [showTrailList, setShowTrailList] = useState(false);
  const [existingGroups, setExistingGroups] = useState([]);
  const [showConflict, setShowConflict] = useState(false);
  const trailRef = useRef(null);
  const navigate = useNavigate();

  // Close trail dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (trailRef.current && !trailRef.current.contains(e.target)) setShowTrailList(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.trailName.trim()) newErrors.trailName = 'Please select a trail';
    if (!formData.name.trim()) newErrors.name = 'Group name is required';
    else if (formData.name.length < 3) newErrors.name = 'Group name must be at least 3 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!formData.trekDate) newErrors.trekDate = 'Trek date is required';
    else if (new Date(formData.trekDate) < new Date()) newErrors.trekDate = 'Must be a future date';
    const max = parseInt(formData.maxMembers);
    if (!formData.maxMembers || max < 2 || max > 100) newErrors.maxMembers = 'Must be between 2 and 100';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, forceCreate = false) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        description: formData.description,
        trailName: formData.trailName,
        trekDate: formData.trekDate,
        maxMembers: parseInt(formData.maxMembers),
        forceCreate
      });
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.code === 'GROUP_CONFLICT') {
        setExistingGroups(error.existingGroups || []);
        setShowConflict(true);
      }
      setIsSubmitting(false);
    }
  };

  const filteredTrails = availableTrails.filter(t => {
    const name = t.name || t.id;
    return !trailSearch || name.toLowerCase().includes(trailSearch.toLowerCase());
  });

  const FieldError = ({ field }) => (
    errors[field] && touched[field] ? (
      <p className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
        <AlertCircle size={12} /> {errors[field]}
      </p>
    ) : null
  );

  const inputClass = (field, accent = 'green') =>
    `w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
      errors[field] && touched[field]
        ? 'border-red-400 focus:ring-red-200'
        : `border-gray-200 hover:border-${accent}-300 focus:ring-${accent}-200 focus:border-${accent}-400`
    }`;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2 text-emerald-800">
            {showConflict ? (
              <Users className="w-5 h-5" />
            ) : (
              <Mountain className="w-5 h-5" />
            )}
            <h2 className="text-lg font-bold">
              {showConflict ? 'Similar Groups Found' : 'Create Trail Group'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {showConflict ? (
          <div className="px-6 py-5">
            <p className="text-sm text-gray-600 mb-4">
              We found existing groups for <strong>{formData.trailName}</strong> on <strong>{new Date(formData.trekDate).toLocaleDateString()}</strong>. You might want to join one of these instead of creating a new one:
            </p>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
              {existingGroups.map(group => (
                <div key={group._id} className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{group.name}</h3>
                    <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full whitespace-nowrap">
                      {group.memberCount}/{group.maxMembers}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{group.description}</p>
                  <button
                    onClick={() => navigate(`/groups/${group._id}`)}
                    className="w-full py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    View Group <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-sm transition-all flex justify-center items-center gap-2"
              >
                {isSubmitting ? 'Creating...' : 'Create New Group Anyway'}
              </button>
              <button
                onClick={() => setShowConflict(false)}
                className="w-full py-2.5 text-gray-600 hover:bg-gray-100 font-medium rounded-xl text-sm transition-all"
              >
                Back to Edit
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, false)} className="px-6 py-5 space-y-5">
          <div className="space-y-5">

            {/* Trail Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-600" />
                Trail <span className="text-red-400">*</span>
              </label>
              {preselectedTrail ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-emerald-800 flex items-center gap-2">
                  <MapPin size={14} /> {preselectedTrail}
                </div>
              ) : (
                <div className="relative" ref={trailRef}>
                  <div
                    className={`flex items-center border rounded-lg cursor-pointer transition-all ${
                      errors.trailName && touched.trailName ? 'border-red-400' : 'border-gray-200 hover:border-emerald-300'
                    } ${showTrailList ? 'ring-2 ring-emerald-200 border-emerald-400' : ''}`}
                  >
                    <input
                      type="text"
                      value={formData.trailName || trailSearch}
                      onChange={(e) => {
                        setTrailSearch(e.target.value);
                        setFormData(prev => ({ ...prev, trailName: '' }));
                        setShowTrailList(true);
                        if (errors.trailName) setErrors(prev => ({ ...prev, trailName: '' }));
                      }}
                      onFocus={() => setShowTrailList(true)}
                      onBlur={() => setTouched(prev => ({ ...prev, trailName: true }))}
                      placeholder="Search and select a trail..."
                      className="flex-1 px-3.5 py-2.5 text-sm bg-transparent outline-none rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTrailList(!showTrailList)}
                      className="px-2 text-gray-400"
                    >
                      <ChevronDown size={16} className={`transition-transform ${showTrailList ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {showTrailList && (
                    <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {filteredTrails.length > 0 ? filteredTrails.map(trail => {
                        const name = trail.name || trail.id;
                        return (
                          <button
                            type="button"
                            key={trail._id || trail.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, trailName: name }));
                              setTrailSearch('');
                              setShowTrailList(false);
                              setErrors(prev => ({ ...prev, trailName: '' }));
                            }}
                            className={`w-full text-left px-3.5 py-2 text-sm hover:bg-emerald-50 transition ${
                              formData.trailName === name ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {name}
                          </button>
                        );
                      }) : (
                        <p className="px-3.5 py-2.5 text-sm text-gray-400">No trails found</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              <FieldError field="trailName" errors={errors} touched={touched} />
            </div>

            {/* Group Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Group Name <span className="text-red-400">*</span></span>
                <span className={`text-xs ${formData.name.length > 40 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {formData.name.length}/50
                </span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={50}
                placeholder="e.g., Sunrise Trek Spring 2026"
                className={inputClass('name')}
              />
              <FieldError field="name" errors={errors} touched={touched} />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Description <span className="text-red-400">*</span></span>
                <span className={`text-xs ${formData.description.length > 450 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {formData.description.length}/500
                </span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={500}
                placeholder="Describe your trek plans, pace, experience level..."
                rows="3"
                className={`${inputClass('description')} resize-none`}
              />
              <FieldError field="description" errors={errors} touched={touched} />
            </div>

            {/* Date & Difficulty Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Trek Date */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-600" />
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="trekDate"
                  value={formData.trekDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputClass('trekDate')}
                />
                <FieldError field="trekDate" errors={errors} touched={touched} />
              </div>

              {/* Max Members */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Users size={14} className="text-emerald-600" />
                  Max Members <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="2"
                  max="100"
                  className={inputClass('maxMembers')}
                />
                <FieldError field="maxMembers" errors={errors} touched={touched} />
              </div>
            </div>

          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Create Group
                </>
              )}
            </button>
          </div>
          </form>
        )}
      </div>
    </div>
  );
}
