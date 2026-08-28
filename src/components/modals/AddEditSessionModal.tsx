import React, { useState, useEffect } from 'react';
import { CourseSession, SessionType } from '../../types';
import { X, Plus, Trash2, Calendar, Link2, FileText, Check } from 'lucide-react';

interface AddEditSessionModalProps {
  sessionToEdit: CourseSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: CourseSession) => void;
}

export const AddEditSessionModal: React.FC<AddEditSessionModalProps> = ({
  sessionToEdit,
  isOpen,
  onClose,
  onSave,
}) => {
  const [dayNumber, setDayNumber] = useState<string>('27');
  const [dayCode, setDayCode] = useState('D27');
  const [weekNumber, setWeekNumber] = useState<number>(6);
  const [dateFormatted, setDateFormatted] = useState('21 Oct (Wed)');
  const [dateIso, setDateIso] = useState('2026-10-21');
  const [type, setType] = useState<SessionType>('Live Class');
  const [topic, setTopic] = useState('');
  const [agenda, setAgenda] = useState('');
  const [subtopics, setSubtopics] = useState<string[]>(['']);
  const [deckUrl, setDeckUrl] = useState('');
  const [filesDriveUrl, setFilesDriveUrl] = useState('');
  const [meetUrl, setMeetUrl] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [assignmentUrl, setAssignmentUrl] = useState('');
  const [batch, setBatch] = useState<'September 2026' | 'October 2026' | 'All batches'>('September 2026');
  const [status, setStatus] = useState<'upcoming' | 'live' | 'completed'>('upcoming');

  useEffect(() => {
    if (sessionToEdit) {
      setDayNumber(String(sessionToEdit.dayNumber));
      setDayCode(sessionToEdit.dayCode);
      setWeekNumber(sessionToEdit.weekNumber);
      setDateFormatted(sessionToEdit.dateFormatted);
      setDateIso(sessionToEdit.dateIso);
      setType(sessionToEdit.type);
      setTopic(sessionToEdit.topic);
      setAgenda(sessionToEdit.agenda);
      setSubtopics(sessionToEdit.subtopics.length > 0 ? sessionToEdit.subtopics : ['']);
      setDeckUrl(sessionToEdit.deckUrl || '');
      setFilesDriveUrl(sessionToEdit.filesDriveUrl || '');
      setMeetUrl(sessionToEdit.meetUrl || '');
      setRecordingUrl(sessionToEdit.recordingUrl || '');
      setAssignmentUrl(sessionToEdit.assignmentUrl || '');
      setBatch(sessionToEdit.batch);
      setStatus(sessionToEdit.status);
    } else {
      // Defaults for new session
      setDayNumber('27');
      setDayCode('D27');
      setWeekNumber(6);
      setDateFormatted('21 Oct (Wed)');
      setDateIso('2026-10-21');
      setType('Live Class');
      setTopic('');
      setAgenda('');
      setSubtopics(['']);
      setDeckUrl('https://docs.google.com/presentation/d/...');
      setFilesDriveUrl('https://drive.google.com/drive/folders/...');
      setMeetUrl('https://meet.google.com/sei-davinci-cohort1');
      setRecordingUrl('');
      setAssignmentUrl('https://forms.gle/...');
      setBatch('September 2026');
      setStatus('upcoming');
    }
  }, [sessionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtopic = () => {
    setSubtopics([...subtopics, '']);
  };

  const handleSubtopicChange = (index: number, val: string) => {
    const updated = [...subtopics];
    updated[index] = val;
    setSubtopics(updated);
  };

  const handleRemoveSubtopic = (index: number) => {
    const updated = subtopics.filter((_, i) => i !== index);
    setSubtopics(updated.length > 0 ? updated : ['']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = dateFormatted.split(' ');
    const dayOfMonth = parts[0] || '15';
    const monthShort = (parts[1] || 'SEP').toUpperCase().substring(0, 3);
    const dayOfWeek = (parts[2] || '(TUE)').replace(/[()]/g, '').toUpperCase();

    const newSession: CourseSession = {
      id: sessionToEdit ? sessionToEdit.id : 's-' + Date.now(),
      dayNumber: dayNumber === '—' ? '—' : Number(dayNumber) || 1,
      dayCode: dayCode.trim() || 'D1',
      weekNumber: Number(weekNumber) || 1,
      dateFormatted: dateFormatted.trim(),
      dateIso: dateIso.trim() || '2026-09-15',
      dayOfWeek: dayOfWeek || 'MON',
      dayOfMonth: dayOfMonth || '15',
      monthShort: monthShort || 'SEP',
      type,
      topic: topic.trim(),
      agenda: agenda.trim() || topic.trim(),
      subtopics: subtopics.filter(s => s.trim().length > 0),
      deckUrl: deckUrl.trim(),
      filesDriveUrl: filesDriveUrl.trim(),
      meetUrl: meetUrl.trim(),
      recordingUrl: recordingUrl.trim(),
      assignmentUrl: assignmentUrl.trim(),
      batch,
      status,
      timeIST: '3:30 PM',
      durationMinutes: 90,
    };

    onSave(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#faf8f5] text-[#2c2a29] rounded-2xl shadow-2xl border border-[#e7ded3] flex flex-col overflow-hidden"
        id="add-edit-session-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f2ecdf] border-b border-[#e2d7c7] shrink-0">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c85a32]">
              Cohort Schedule Manager
            </span>
            <h3 className="text-base font-bold text-stone-900">
              {sessionToEdit ? `Edit Session: ${sessionToEdit.topic}` : '+ Add New Cohort Session'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Row 1: Day Code, Week, Date, Type */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Day Code</label>
              <input
                type="text"
                placeholder="e.g. D1 or DOUBT"
                value={dayCode}
                onChange={(e) => setDayCode(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-[#c85a32]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Week Number</label>
              <select
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-[#c85a32]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Date Format</label>
              <input
                type="text"
                placeholder="e.g. 15 Sep (Tue)"
                value={dateFormatted}
                onChange={(e) => setDateFormatted(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-[#c85a32]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Session Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SessionType)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-[#c85a32]"
              >
                <option value="Live Class">Live Class</option>
                <option value="Concept">Concept</option>
                <option value="Doubt Session">Doubt Session</option>
                <option value="Off">Off / Rest</option>
                <option value="TA Pod">TA Pod</option>
                <option value="Kickoff">Kickoff</option>
                <option value="Demo">Demo</option>
              </select>
            </div>
          </div>

          {/* Topic & Agenda */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Topic Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Fusion Page Introduction (Zem TV Style Editing Intro)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-[#c85a32]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Agenda Summary</label>
            <input
              type="text"
              placeholder="e.g. The Secret to Zem TV Motion Graphics: Nodes, Flow & Viewers"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-[#c85a32]"
            />
          </div>

          {/* Subtopics */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Detailed Subtopics (Checklist Items)
              </label>
              <button
                type="button"
                onClick={handleAddSubtopic}
                className="text-xs font-semibold text-[#c85a32] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subtopic
              </button>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {subtopics.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-mono">#{idx + 1}</span>
                  <input
                    type="text"
                    value={sub}
                    onChange={(e) => handleSubtopicChange(idx, e.target.value)}
                    placeholder="e.g. Core node types: MediaIn/Out, Merge, Transform"
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#c85a32]"
                  />
                  {subtopics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtopic(idx)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="p-3.5 bg-[#f5ede2] rounded-xl border border-[#e4d8c8] space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#c85a32]" />
              Day Resource & Access Links
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Slides / Deck URL</label>
                <input
                  type="text"
                  placeholder="https://docs.google.com/presentation/..."
                  value={deckUrl}
                  onChange={(e) => setDeckUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Google Drive Files URL</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={filesDriveUrl}
                  onChange={(e) => setFilesDriveUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Google Meet Live Class URL</label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/..."
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Class Recording URL</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom batch & status */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Batch</label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none"
              >
                <option value="September 2026">September 2026</option>
                <option value="October 2026">October 2026</option>
                <option value="All batches">All batches</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Class Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg outline-none"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live Now</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              {sessionToEdit ? 'Save Session Changes' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
