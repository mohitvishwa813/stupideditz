import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { X, Save, Plus, Trash2, BookOpen, DollarSign, User, Sparkles, Image, Star } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

interface AddEditCourseModalProps {
  isOpen: boolean;
  courseToEdit: Course | null;
  onClose: () => void;
  onSave: (course: Course) => void;
}

export const AddEditCourseModal: React.FC<AddEditCourseModalProps> = ({
  isOpen,
  courseToEdit,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [batch, setBatch] = useState('September 2026 Live Cohort');
  const [startDate, setStartDate] = useState('15 Sep 2026');
  const [totalDays, setTotalDays] = useState(26);
  const [durationWeeks, setDurationWeeks] = useState(6);
  const [price, setPrice] = useState(19920);
  const [originalPrice, setOriginalPrice] = useState(39920);
  const [level, setLevel] = useState('Beginner to Advanced Pro');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState('');
  const [instructorName, setInstructorName] = useState('Arjun Rajput');
  const [instructorRole, setInstructorRole] = useState('Lead Documentary Editor');
  const [instructorAvatar, setInstructorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
  const [isPopular, setIsPopular] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([
    '26 Days of Interactive Live Classes (Mon–Fri, 3:30 PM IST)',
    'Every Saturday Dedicated Doubt Clearing & Timeline Review'
  ]);
  const [newHighlight, setNewHighlight] = useState('');
  const [whatYouWillLearnLink, setWhatYouWillLearnLink] = useState('');

  useEffect(() => {
    if (courseToEdit) {
      setTitle(courseToEdit.title);
      setSubtitle(courseToEdit.subtitle || '');
      setBatch(courseToEdit.batch || 'September 2026 Live Cohort');
      setStartDate(courseToEdit.startDate || '15 Sep 2026');
      setTotalDays(courseToEdit.totalDays || 26);
      setDurationWeeks(courseToEdit.durationWeeks || 6);
      setPrice(courseToEdit.price || 19920);
      setOriginalPrice(courseToEdit.originalPrice || courseToEdit.price * 2);
      setLevel(courseToEdit.level || 'Beginner to Advanced Pro');
      setThumbnail(courseToEdit.thumbnail || '');
      setDescription(courseToEdit.description || '');
      setInstructorName(courseToEdit.instructorName || 'Arjun Rajput');
      setInstructorRole(courseToEdit.instructorRole || 'Lead Editor');
      setInstructorAvatar(courseToEdit.instructorAvatar || '');
      setIsPopular(Boolean(courseToEdit.isPopular));
      setHighlights(courseToEdit.highlights?.length ? courseToEdit.highlights : ['Live 90-Min Daily Cohort']);
      setWhatYouWillLearnLink(courseToEdit.whatYouWillLearnLink || '');
    } else {
      setTitle('');
      setSubtitle('');
      setDescription('');
      setHighlights(['Live 90-Min Daily Classes', 'Dedicated Saturday Doubt Session']);
      setWhatYouWillLearnLink('');
    }
  }, [courseToEdit]);

  if (!isOpen) return null;

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playPop();

    const courseData: Course = {
      id: courseToEdit ? courseToEdit.id : 'course-' + Date.now(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      batch: batch,
      startDate: startDate,
      totalDays: Number(totalDays),
      durationWeeks: Number(durationWeeks),
      price: Number(price),
      originalPrice: Number(originalPrice),
      rating: courseToEdit?.rating || 4.9,
      reviewsCount: courseToEdit?.reviewsCount || 120,
      studentsCount: courseToEdit?.studentsCount || 450,
      level: level,
      tags: ['DaVinci Resolve 19', 'Live Masterclass'],
      thumbnail: thumbnail.trim(),
      description: description.trim(),
      highlights: highlights,
      instructorName: instructorName.trim(),
      instructorRole: instructorRole.trim(),
      instructorAvatar: instructorAvatar.trim(),
      isPopular: isPopular,
      whatYouWillLearnLink: whatYouWillLearnLink.trim()
    };

    onSave(courseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#10131f] text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#141726] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 font-mono">
                COHORT CMS
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {courseToEdit ? 'Edit Masterclass Course' : 'Create New Masterclass Course'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Course Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DaVinci Resolve 19: High-Retention Masterclass"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Course Subtitle (Card Teaser Line)
            </label>
            <input
              type="text"
              required
              placeholder="From zero to advanced documentary & YouTube editing. Cut Page speed, Fairlight audio..."
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Full Course Description
            </label>
            <textarea
              required
              rows={2}
              placeholder="The definitive 26-day live masterclass taught by senior documentary editors..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Offer Price (INR ₹)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Original Price (INR ₹)
              </label>
              <input
                type="number"
                required
                value={originalPrice}
                onChange={e => setOriginalPrice(Number(e.target.value))}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Skill Level
              </label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Beginner to Advanced Pro">Beginner to Advanced Pro</option>
                <option value="Intermediate to Advanced">Intermediate to Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Cohort Batch Name
              </label>
              <input
                type="text"
                value={batch}
                onChange={e => setBatch(e.target.value)}
                placeholder="e.g. September 2026 Live Cohort"
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Thumbnail Image URL
              </label>
              <input
                type="text"
                value={thumbnail}
                onChange={e => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              "What You Will Learn" Link (URL)
            </label>
            <input
              type="url"
              value={whatYouWillLearnLink}
              onChange={e => setWhatYouWillLearnLink(e.target.value)}
              placeholder="https://docs.google.com/..."
              className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Instructor Name
              </label>
              <input
                type="text"
                value={instructorName}
                onChange={e => setInstructorName(e.target.value)}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Instructor Title/Role
              </label>
              <input
                type="text"
                value={instructorRole}
                onChange={e => setInstructorRole(e.target.value)}
                className="w-full bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#161a29] border border-slate-700/80 rounded-xl">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={e => setIsPopular(e.target.checked)}
                  className="rounded text-blue-500 focus:ring-0"
                />
                <span className="text-xs font-semibold text-slate-200">Highlight as "MOST POPULAR"</span>
              </label>
            </div>
          </div>

          {/* Highlights / Features List */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Course Highlights & Key Features
            </label>
            <div className="space-y-2 mb-2">
              {highlights.map((h, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-[#161a29] border border-slate-800 rounded-xl text-xs">
                  <span className="text-slate-200 truncate">{h}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    className="text-rose-400 hover:text-rose-300 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add bullet highlight..."
                value={newHighlight}
                onChange={e => setNewHighlight(e.target.value)}
                className="flex-1 bg-[#161a29] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{courseToEdit ? 'Save Masterclass Changes' : 'Create Masterclass Course'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
