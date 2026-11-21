import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  BarChart3,
  Building2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileText,
  Flame,
  GitFork,
  Home,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Map,
  MessageSquare,
  Package,
  Radio,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Users,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingApprovalsCount?: number;
  activeIncidentsCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount = 0,
  activeIncidentsCount = 0,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navSections = [
    {
      group: 'COMMAND',
      items: [
        { id: 'dashboard', label: 'Command Centre', icon: LayoutDashboard },
        { id: 'incidents', label: 'Incidents & SOS', icon: AlertTriangle, badge: activeIncidentsCount > 0 ? activeIncidentsCount : undefined },
        { id: 'map', label: 'Live Operations Map', icon: Map },
      ],
    },
    {
      group: 'RESPONSE OPERATIONS',
      items: [
        { id: 'dispatch', label: 'Fleet & Dispatch', icon: Ambulance },
        { id: 'hospitals', label: 'Hospital Network', icon: Building2 },
        { id: 'rescue', label: 'Rescue Operations', icon: LifeBuoy },
        { id: 'medical', label: 'Medical Logistics', icon: Package },
        { id: 'shelters', label: 'Evacuation & Shelters', icon: Home },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { id: 'agents', label: 'AI Agent Control Room', icon: Cpu },
        { id: 'traces', label: 'Agent Execution Traces', icon: GitFork },
        { id: 'approvals', label: 'Approval Centre', icon: ShieldCheck, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined, badgeColor: 'bg-red-500' },
        { id: 'simulator', label: 'Disaster Simulator', icon: Sliders },
      ],
    },
    {
      group: 'ADMINISTRATION & REPORTING',
      items: [
        { id: 'communication', label: 'Agency Communications', icon: Radio },
        { id: 'reports', label: 'Situation Reports', icon: FileText },
        { id: 'analytics', label: 'Analytics & Performance', icon: BarChart3 },
        { id: 'admin', label: 'System Administration', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`bg-[#101C2B] border-r border-[#263B50] flex flex-col h-screen select-none shrink-0 transition-all duration-200 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-3.5 border-b border-[#263B50] flex items-center justify-between">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          {/* Cyan Angled A Logo matching Reference Screenshots */}
          <div className="w-8 h-8 rounded bg-[#132438] border border-[#23B9D6]/40 flex items-center justify-center shrink-0 shadow-panel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 22H7L12 11L17 22H22L12 2Z"
                fill="#23B9D6"
              />
              <path
                d="M8.5 16H15.5"
                stroke="#080F1B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-white font-extrabold tracking-wider text-base font-sans leading-none">
                  SAVE
                </span>
                <span className="text-[9px] bg-[#23B9D6]/15 text-[#23B9D6] border border-[#23B9D6]/30 px-1 py-0.2 rounded font-mono font-semibold">
                  PRO
                </span>
              </div>
              <div className="text-[9px] text-[#94A3B8] tracking-tight truncate mt-0.5 font-medium leading-tight">
                Strategic Agent-Based Victim Evacuation
              </div>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="text-[#64748B] hover:text-white p-1 rounded hover:bg-[#172B40] transition"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navSections.map((sec) => (
          <div key={sec.group} className="space-y-1">
            {!isCollapsed && (
              <div className="text-[10px] font-bold text-[#64748B] px-2.5 py-1 tracking-wider uppercase font-mono">
                {sec.group}
              </div>
            )}

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'nav-item-active text-white'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#172B40]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#23B9D6]' : 'text-[#94A3B8]'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate tracking-wide text-[12px]">
                        {item.label}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        item.badgeColor
                          ? `${item.badgeColor} text-white`
                          : 'bg-[#172B40] text-[#23B9D6] border border-[#263B50]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer System Mode Indicator */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#263B50] bg-[#0D1829] flex items-center justify-between text-[10px]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] pulse-live"></span>
            <span className="text-[#94A3B8] font-mono font-medium">EOC KERNEL v2.4</span>
          </div>
          <span className="text-[#64748B] font-mono">10 AGENTS</span>
        </div>
      )}
    </aside>
  );
};
