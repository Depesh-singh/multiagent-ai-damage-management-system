import React, { useEffect, useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  LogOut,
  RefreshCw,
  Shield,
  User,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { UserProfile } from '@/lib/api';

interface TopBarProps {
  title: string;
  subtitle?: string;
  dbConnected: boolean;
  n8nConnected?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onSyncLiveFeed?: () => void;
  isSyncingFeed?: boolean;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  notificationCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  dbConnected,
  n8nConnected = true,
  isRefreshing = false,
  onRefresh,
  onSyncLiveFeed,
  isSyncingFeed = false,
  currentUser,
  onOpenAuthModal,
  onLogout,
  notificationCount = 3,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: Jan 26, 2025
      const dateStr = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      // Format: 14:37:09 IST
      const timeStr =
        now.toTimeString().split(' ')[0] + ' IST';

      setCurrentDate(dateStr);
      setCurrentTime(timeStr);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-[68px] bg-[#101C2B] border-b border-[#263B50] px-5 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Page Title & Description */}
      <div className="flex flex-col justify-center min-w-0 pr-4">
        <h1 className="text-white text-lg font-black tracking-tight truncate flex items-center space-x-2">
          <span>{title}</span>
        </h1>
        {subtitle && (
          <p className="text-xs text-[#94A3B8] tracking-tight truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls matching the 13 Visual References */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* n8n Multi-Agent Engine Badge */}
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border font-mono ${
            n8nConnected
              ? 'bg-amber-950/60 text-[#F59E0B] border-amber-800 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-slate-900/60 text-[#64748B] border-slate-700/60'
          }`}
          title={
            n8nConnected
              ? 'n8n Multi-Agent Workflow Engine Active on Port 5678 (v2 Orchestrator)'
              : 'n8n Engine Standby'
          }
        >
          <Zap className={`w-4 h-4 ${n8nConnected ? 'text-[#F59E0B] animate-pulse' : 'text-[#64748B]'}`} />
          <span className="hidden sm:inline font-bold">
            {n8nConnected ? 'n8n Active (5678)' : 'n8n Standby'}
          </span>
        </div>

        {/* Live Real-Time Feed Ingestion (USGS Live Earthquakes) */}
        {onSyncLiveFeed && (
          <button
            onClick={onSyncLiveFeed}
            disabled={isSyncingFeed}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 text-cyan-300 border border-cyan-700/60 text-xs font-bold transition shadow-sm disabled:opacity-50"
            title="Fetch Real-Time USGS Earthquakes & Environmental Disasters (Zero Mock Data)"
          >
            <Globe className={`w-4 h-4 ${isSyncingFeed ? 'animate-spin text-cyan-400' : 'text-cyan-300'}`} />
            <span className="hidden md:inline">
              {isSyncingFeed ? 'Syncing Live...' : '🌐 Real-Time Live Feed'}
            </span>
          </button>
        )}

        {/* Backend Connection Health Badge */}
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border font-mono ${
            dbConnected
              ? 'bg-emerald-950/60 text-[#22C55E] border-emerald-800 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
              : 'bg-red-950/60 text-[#EF4444] border-red-800'
          }`}
          title={dbConnected ? 'Backend REST & DB Connected' : 'Backend Disconnected'}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full inline-block ${
              dbConnected ? 'bg-[#22C55E] pulse-live' : 'bg-[#EF4444] pulse-critical'
            }`}
          />
          <span className="hidden sm:inline">
            {dbConnected ? 'System Operational' : 'Connection Lost'}
          </span>
        </div>

        {/* Live Date & Time Indicator */}
        <div className="hidden md:flex items-center space-x-2 bg-[#132438] px-3 py-1 rounded-md border border-[#263B50] text-[11px] font-mono text-[#F1F5F9]">
          <Calendar className="w-3.5 h-3.5 text-[#23B9D6]" />
          <span>{currentDate}</span>
          <span className="text-[#64748B]">|</span>
          <Clock className="w-3.5 h-3.5 text-[#23B9D6]" />
          <span>{currentTime}</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-md bg-[#132438] hover:bg-[#172B40] text-[#94A3B8] hover:text-white border border-[#263B50] transition disabled:opacity-50"
            title="Refresh Operational Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#23B9D6]' : ''}`} />
          </button>
        )}

        {/* Notification Bell with Badge */}
        <button className="relative p-1.5 rounded-md bg-[#132438] hover:bg-[#172B40] text-[#94A3B8] hover:text-white border border-[#263B50] transition">
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 bg-[#132438] hover:bg-[#172B40] border border-[#263B50] rounded-md px-2.5 py-1 transition"
          >
            <div className="w-6 h-6 rounded-full bg-[#23B9D6]/20 border border-[#23B9D6]/40 flex items-center justify-center text-[#23B9D6] text-xs font-bold font-mono">
              {currentUser?.full_name?.charAt(0) || 'C'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-[11px] font-bold text-white leading-tight">
                {currentUser?.full_name || 'Command Admin'}
              </div>
              <div className="text-[9px] text-[#94A3B8] font-mono leading-none">
                {currentUser?.role || 'National EOC'}
              </div>
            </div>
          </button>

          {/* User Profile Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 ares-card p-2 shadow-2xl z-50 text-xs border border-[#263B50]">
              <div className="p-2 border-b border-[#263B50] mb-1">
                <div className="font-bold text-white">{currentUser?.full_name || 'Command Admin'}</div>
                <div className="text-[10px] text-[#94A3B8] font-mono">{currentUser?.email || 'admin@save.gov.in'}</div>
                <div className="text-[10px] text-[#23B9D6] font-mono mt-0.5">{currentUser?.role || 'INCIDENT_COMMANDER'}</div>
              </div>

              {currentUser ? (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left px-2 py-1.5 text-[#EF4444] hover:bg-[#172B40] rounded flex items-center space-x-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onOpenAuthModal) onOpenAuthModal();
                  }}
                  className="w-full text-left px-2 py-1.5 text-[#23B9D6] hover:bg-[#172B40] rounded flex items-center space-x-2 transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Authenticate Operator</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
