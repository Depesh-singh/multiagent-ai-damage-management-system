import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Shield, Sliders, X } from 'lucide-react';
import { aresApi } from '@/lib/api';

interface WhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({ isOpen, onClose }) => {
  const [selectedScenario, setSelectedScenario] = useState('HOSPITAL_SHUTDOWN');
  const [targetEntity, setTargetEntity] = useState('SSKM Hospital');
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'HOSPITAL_SHUTDOWN',
      title: 'Hospital Power & Generator Failure',
      desc: 'Simulates major electrical blackout at a tertiary trauma center forcing casualty diversion.',
      defaultTarget: 'SSKM Hospital',
    },
    {
      id: 'ROAD_BLOCKAGE',
      title: 'Arterial Flyover Collapse / Gridlock',
      desc: 'Simulates structural fracture on AJC Bose Road blocking emergency ambulance corridor.',
      defaultTarget: 'AJC Bose Road / Exide Crossing',
    },
    {
      id: 'SECONDARY_AFTERSHOCK',
      title: 'Secondary Magnitude 5.2 Aftershock',
      desc: 'Simulates secondary seismic tremor triggering expanded GIS danger zones and building collapses.',
      defaultTarget: 'South Kolkata District',
    },
    {
      id: 'RESOURCE_SHORTAGE',
      title: 'Critical Blood / Oxygen Depletion',
      desc: 'Simulates drop of O-Negative Blood Bank reserves below 20% requiring emergency airlift.',
      defaultTarget: 'Central Blood Depot',
    },
  ];

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await aresApi.runWhatIf(selectedScenario, targetEntity);
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131F31] border border-[#1E3A5F] w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#1E3A5F] flex items-center justify-between bg-[#0B1220]/60">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <Sliders className="w-4 h-4" />
            <span>ARES DISASTER WHAT-IF SIMULATION ENGINE</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Select Contingency Stress Scenario</label>
            <div className="grid grid-cols-2 gap-2">
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenario(sc.id);
                    setTargetEntity(sc.defaultTarget);
                    setSimulationResult(null);
                  }}
                  className={`p-3 rounded text-left border transition ${
                    selectedScenario === sc.id
                      ? 'bg-[#1A2940] border-amber-500 text-amber-300 shadow-md'
                      : 'bg-[#0B1220] border-[#1E3A5F] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-bold text-xs mb-1">{sc.title}</div>
                  <div className="text-[11px] text-slate-400 leading-tight">{sc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <label className="block text-slate-300 font-medium mb-1">Simulated Target Entity</label>
              <input
                type="text"
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#1E3A5F] rounded px-3 py-2 text-white"
              />
            </div>
            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="mt-5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded flex items-center space-x-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Evaluating...' : 'Simulate Recalculation'}</span>
            </button>
          </div>

          {/* Simulation Output */}
          {simulationResult && (
            <div className="bg-[#0B1220] border border-amber-500/40 rounded-lg p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-2">
                <div className="text-amber-400 font-bold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{simulationResult.simulated_event}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {simulationResult.system_resilience_score}
                </span>
              </div>

              {/* Dynamic Multi-Agent Recalculation Summary */}
              <div>
                <div className="text-slate-400 font-semibold mb-1 text-[11px] uppercase tracking-wider">
                  Automated Multi-Agent Response Re-alignment:
                </div>
                <div className="space-y-1.5 bg-[#131F31] p-2.5 rounded border border-[#1E3A5F]">
                  {Object.entries(simulationResult.multi_agent_recalculation || {}).map(([agent, action]: any) => (
                    <div key={agent} className="flex items-start space-x-2">
                      <span className="text-cyan-400 font-semibold shrink-0">[{agent}]:</span>
                      <span className="text-slate-200">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Breakdown */}
              <div className="text-[11px] text-slate-300 bg-[#131F31]/60 p-2 rounded">
                <b>Operational Consequence: </b>
                {JSON.stringify(simulationResult.impact_analysis)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1E3A5F] bg-[#0B1220]/60 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs">
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
