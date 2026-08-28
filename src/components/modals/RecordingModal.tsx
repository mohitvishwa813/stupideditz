import React, { useState } from 'react';
import { CourseSession } from '../../types';
import { X, Play, Download, ExternalLink, Clock, BookOpen } from 'lucide-react';

interface RecordingModalProps {
  session: CourseSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecordingModal: React.FC<RecordingModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl bg-[#18191e] text-white rounded-2xl shadow-2xl border border-stone-800 overflow-hidden"
        id="recording-player-modal"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#202127] border-b border-stone-800">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-[#c85a32] text-white">
              {session.dayCode} • Recording
            </span>
            <h3 className="text-base font-semibold text-stone-100 truncate max-w-md">
              {session.topic}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center group">
          {isPlaying ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0`}
              title={session.topic}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 text-center">
              <img
                src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80"
                alt="Thumbnail"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <button
                onClick={() => setIsPlaying(true)}
                className="relative z-10 w-20 h-20 bg-[#c85a32] hover:bg-[#b54a24] text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 active:scale-95 mb-4 group-hover:ring-4 group-hover:ring-[#c85a32]/40"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
              <p className="relative z-10 text-sm font-medium text-stone-300 max-w-md">
                Click to stream class recording (1080p 60fps). Includes raw DaVinci Resolve project screen share & timeline scrubbing.
              </p>
              <div className="relative z-10 flex items-center gap-4 mt-3 text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#c85a32]" /> {session.durationMinutes} mins
                </span>
                <span>•</span>
                <span>Instructor: Arjun Rajput (Stupid Editz)</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Details & Links */}
        <div className="p-6 bg-[#18191e] border-t border-stone-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-[#c85a32]" />
              Session Agenda
            </h4>
            <p className="text-xs text-stone-300">
              {session.agenda}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            {session.filesDriveUrl && (
              <a
                href={session.filesDriveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700"
              >
                <Download className="w-3.5 h-3.5 text-stone-400" />
                Raw Day Files
              </a>
            )}
            <a
              href={session.deckUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#c85a32] hover:bg-[#b04825] rounded-lg transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Class Slides
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
