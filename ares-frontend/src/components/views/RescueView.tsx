import React from 'react';
import { LifeBuoy, Phone, Shield, Users } from 'lucide-react';

interface RescueViewProps {
  rescueTeams: any[];
}

export const RescueView: React.FC<RescueViewProps> = ({ rescueTeams }) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">
      <div className="ares-panel p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              TACTICAL RESCUE FORMATIONS & HEAVY EXTRICATION
            </h1>
            <p className="text-xs text-slate-400">
              NDRF (National) • SDRF (State) • Fire & Emergency Services • Kolkata Police DMG
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 pr-1">
        {rescueTeams.map((team, i) => (
          <div key={team.id || i} className="ares-panel p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-bold text-sm">{team.name}</h3>
                <div className="text-slate-400 text-xs mt-0.5">
                  Type: <b className="text-amber-400">{team.type}</b> • Active Responders: <b className="text-white font-mono">{team.members_count || 35}</b>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
                {team.status || 'AVAILABLE'}
              </span>
            </div>

            <div className="bg-[#0B1220] p-2.5 rounded border border-[#1E3A5F]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">
                Technical Competencies:
              </div>
              <div className="flex flex-wrap gap-1">
                {(team.skills || ['Collapsed Structure Search & Rescue', 'Heavy Extrication']).map((sk: string, idx: number) => (
                  <span key={idx} className="bg-[#1A2940] text-slate-300 text-[10px] px-2 py-0.5 rounded border border-[#1E3A5F]">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1E3A5F] text-slate-400">
              <span>Location: {team.lat?.toFixed(4)}, {team.lng?.toFixed(4)}</span>
              <span className="flex items-center space-x-1 font-mono text-[#23B9D6]">
                <Phone className="w-3 h-3" />
                <span>{team.contact_phone}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
