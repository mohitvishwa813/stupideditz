import React from 'react';
import { Film, Heart, Youtube, Instagram, Twitter, Shield, Mail, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'student-portal' | 'admin-console' | 'assets' | 'breakdowns') => void;
  onOpenLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLogin }) => {
  return (
    <footer className="bg-[#070910] border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Film className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                STUPID<span className="text-blue-500">EDITZ</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              The premier DaVinci Resolve & documentary motion masterclass. Helping editors craft high-retention stories, master keyboard workflows, and build high-earning editing careers.
            </p>
            <div className="flex items-center gap-3 pt-1 text-slate-400">
              <a href="https://youtube.com/@stupidmaan?si=PkbOEpfa33QZTMA9" target="_blank" rel="noreferrer" className="hover:text-red-500 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/horizontal_by_kavish?igsi=MWZscHZwaDh0aHg5ZA%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" className="hover:text-pink-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Masterclass Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('student-portal')} className="hover:text-emerald-400 transition-colors">
                  Student Learning Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('assets')} className="hover:text-white transition-colors">
                  Creator Asset Vault (40GB)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('breakdowns')} className="hover:text-white transition-colors">
                  Documentary Breakdowns
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Stupid Editz Studio. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              infostupideditz@gmail.com
            </span>
            <span>DaVinci Resolve Studio Pipeline</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
