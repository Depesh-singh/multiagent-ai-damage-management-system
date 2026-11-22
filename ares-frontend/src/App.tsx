import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';

// 16 Complete Reconstructed Views (13 Reference Screens + 3 System Workspaces)
import { CommandCentreView } from './components/views/CommandCentreView';
import { IncidentManagementView } from './components/views/IncidentManagementView';
import { LiveOperationsMapView } from './components/views/LiveOperationsMapView';
import { FleetDispatchView } from './components/views/FleetDispatchView';
import { HospitalNetworkView } from './components/views/HospitalNetworkView';
import { RescueOperationsView } from './components/views/RescueOperationsView';
import { MedicalLogisticsView } from './components/views/MedicalLogisticsView';
import { EvacuationSheltersView } from './components/views/EvacuationSheltersView';
import { AgentControlRoomView } from './components/views/AgentControlRoomView';
import { AgentExecutionTracesView } from './components/views/AgentExecutionTracesView';
import { ApprovalCentreView } from './components/views/ApprovalCentreView';
import { DisasterSimulatorView } from './components/views/DisasterSimulatorView';
import { AgencyCommunicationsView } from './components/views/AgencyCommunicationsView';
import { SituationReportsView } from './components/views/SituationReportsView';
import { AnalyticsPerformanceView } from './components/views/AnalyticsPerformanceView';
import { SystemAdministrationView } from './components/views/SystemAdministrationView';

// Modals
import { SosReportModal } from './components/modals/SosReportModal';
import { WhatIfModal } from './components/modals/WhatIfModal';
import { ResponsePlanModal } from './components/modals/ResponsePlanModal';

import {
  aresApi,
  Incident,
  Hospital,
  Ambulance,
  RescueTeam,
  Shelter,
  AgentStatus,
  AgentRun,
  EmergencyContact,
  AgencyMessage,
  UserProfile,
} from './lib/api';
import { useAresWebSocket } from './lib/useWebSocket';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Core Operational Datastore
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [agentsStatus, setAgentsStatus] = useState<AgentStatus[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [messages, setMessages] = useState<AgencyMessage[]>([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: 'user-01',
    username: 'commander.kolkata',
    email: 'commander@save.gov.in',
    role: 'ADMIN',
    full_name: 'Col. Rajesh Sharma',
    agency: 'National Disaster Response Authority',
  });

  // Selected incident & active tactical response plan
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [responsePlan, setResponsePlan] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [riskZones, setRiskZones] = useState<any[]>([]);
  const [roadClosures, setRoadClosures] = useState<any[]>([]);

  // Modal controls
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [loadingIncidentId, setLoadingIncidentId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [n8nConnected, setN8nConnected] = useState(false);
  const [isSyncingFeed, setIsSyncingFeed] = useState(false);

  // Check n8n multi-agent status
  const checkN8nStatus = async () => {
    try {
      const status = await aresApi.getN8nStatus();
      setN8nConnected(Boolean(status?.connected));
    } catch {
      setN8nConnected(false);
    }
  };

  // Sync Live Real-Time Disasters (USGS Live Earthquakes)
  const handleSyncLiveFeed = async () => {
    setIsSyncingFeed(true);
    try {
      await aresApi.syncRealtimeDisasterFeed(true);
      await loadAllData();
    } catch (err) {
      console.error('Error syncing live feed:', err);
    } finally {
      setIsSyncingFeed(false);
    }
  };

  // Real-time WebSocket sync with automatic fallback
  useAresWebSocket({
    onIncidentCreated: () => loadAllData(),
    onIncidentUpdated: () => loadAllData(),
    onAgentRunCompleted: () => loadAllData(),
    onApprovalCreated: () => loadAllData(),
    onApprovalDecided: () => loadAllData(),
    onDispatchUpdated: () => loadAllData(),
  });

  // Initial Data Load & Continuous 5-Second Telemetry Sync
  useEffect(() => {
    loadAllData();
    checkN8nStatus();
    const interval = setInterval(() => {
      loadAllData();
      checkN8nStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const [incs, hosps, ambs, teams, shs, agents, runs, cts, msgs, approvals] = await Promise.allSettled([
        aresApi.getIncidents(),
        aresApi.getHospitals(),
        aresApi.getAmbulances(),
        aresApi.getRescueTeams(),
        aresApi.getShelters(),
        aresApi.getAgentsStatus(),
        aresApi.getAgentRuns(),
        aresApi.getEmergencyContacts(),
        aresApi.getAgencyMessages(),
        aresApi.getApprovals('PENDING'),
      ]);

      if (incs.status === 'fulfilled') {
        const list = Array.isArray(incs.value) ? incs.value : [];
        setIncidents(list);
        setDbConnected(true);
        setSelectedIncident((prev) => {
          if (!list || list.length === 0) return null;
          if (!prev) return list[0];
          return list.find((i) => i.id === prev.id) || list[0];
        });
      }

      if (hosps.status === 'fulfilled' && hosps.value) setHospitals(hosps.value);
      if (ambs.status === 'fulfilled' && ambs.value) setAmbulances(ambs.value);
      if (teams.status === 'fulfilled' && teams.value) setRescueTeams(teams.value);
      if (shs.status === 'fulfilled' && shs.value) setShelters(shs.value);
      if (agents.status === 'fulfilled' && agents.value) setAgentsStatus(agents.value);
      if (runs.status === 'fulfilled' && Array.isArray(runs.value)) setAgentRuns(runs.value);
      if (cts.status === 'fulfilled' && cts.value) setContacts(cts.value);
      if (msgs.status === 'fulfilled' && msgs.value) setMessages(msgs.value);
      if (approvals.status === 'fulfilled' && Array.isArray(approvals.value)) {
        setPendingApprovalsCount(approvals.value.length);
      }
    } catch (err) {
      console.warn('Data load error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Trigger Multi-Agent Response for a specific incident
  const handleTriggerResponse = async (incidentId: string) => {
    setLoadingIncidentId(incidentId);
    try {
      const plan = await aresApi.triggerMultiAgentResponse(incidentId);
      setResponsePlan(plan);
      if (plan.route_optimization?.routes) setRoutes(plan.route_optimization.routes);
      if (plan.risk_assessment?.zones) setRiskZones(plan.risk_assessment.zones);
      if (plan.route_optimization?.road_closures) setRoadClosures(plan.route_optimization.road_closures);
      setIsPlanOpen(true);
      await loadAllData();
    } catch (err) {
      console.error('Trigger response error:', err);
    } finally {
      setLoadingIncidentId(null);
    }
  };

  // 1-Click Complete Earthquake Demonstration Flow
  const handleTriggerEarthquakeDemo = async () => {
    setIsDemoRunning(true);
    try {
      const demoResult = await aresApi.triggerEarthquakeDemo();
      if (demoResult.response_plan) {
        setResponsePlan(demoResult.response_plan);
        if (demoResult.response_plan.route_optimization?.routes) {
          setRoutes(demoResult.response_plan.route_optimization.routes);
        }
        if (demoResult.response_plan.risk_assessment?.zones) {
          setRiskZones(demoResult.response_plan.risk_assessment.zones);
        }
        if (demoResult.response_plan.route_optimization?.road_closures) {
          setRoadClosures(demoResult.response_plan.route_optimization.road_closures);
        }
        setIsPlanOpen(true);
      }
      await loadAllData();
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Earthquake demo error:', err);
    } finally {
      setIsDemoRunning(false);
    }
  };

  // SOS Submission
  const handleReportSos = async (data: any) => {
    try {
      const newInc = await aresApi.reportIncident(data);
      await loadAllData();
      setSelectedIncident(newInc);
      handleTriggerResponse(newInc.id);
    } catch (err) {
      console.error('Report SOS error:', err);
    }
  };

  // Clear All Incidents
  const handleClearIncidents = async () => {
    try {
      await aresApi.clearAllIncidents();
      setIncidents([]);
      setSelectedIncident(null);
      setResponsePlan(null);
      setRoutes([]);
      setRiskZones([]);
      setRoadClosures([]);
      await loadAllData();
    } catch (err) {
      console.error('Failed to clear incidents:', err);
    }
  };

  // Dynamic Page Headers & Subtitles
  const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'COMMAND CENTRE',
      subtitle: 'Real-time multi-agency situational overview & emergency telemetry',
    },
    incidents: {
      title: 'INCIDENT MANAGEMENT & SOS',
      subtitle: 'Active emergency directory, risk classification & agent dispatch',
    },
    map: {
      title: 'LIVE OPERATIONS GIS MAP',
      subtitle: 'High-resolution GIS telemetry, tactical corridors & perimeter tracking',
    },
    dispatch: {
      title: 'FLEET & DISPATCH',
      subtitle: 'Real-time ambulance monitoring, ETA telemetry & transit optimization',
    },
    hospitals: {
      title: 'HOSPITAL NETWORK',
      subtitle: 'ICU bed occupancy, emergency triage capacity & patient intake',
    },
    rescue: {
      title: 'RESCUE OPERATIONS',
      subtitle: 'NDRF, SDRF, and civil defense search & rescue formations',
    },
    medical: {
      title: 'MEDICAL LOGISTICS',
      subtitle: 'Critical pharmaceuticals, trauma kits & warehouse distribution',
    },
    shelters: {
      title: 'EVACUATION & SHELTERS',
      subtitle: 'Disaster shelter occupancy, evacuation routing & intake management',
    },
    agents: {
      title: 'AI AGENT CONTROL ROOM',
      subtitle: 'Autonomous multi-agent orchestration, health monitoring & triggers',
    },
    traces: {
      title: 'AGENT EXECUTION TRACES',
      subtitle: 'Step-by-step reasoning logs, dependency DAGs & telemetry inspection',
    },
    approvals: {
      title: 'APPROVAL CENTRE',
      subtitle: 'Human-in-the-loop review queue, impact assessment & dispatch authorization',
    },
    simulator: {
      title: 'DISASTER SCENARIO SIMULATOR',
      subtitle: 'Predictive what-if physics modeling, seismic impact & response forecasting',
    },
    communication: {
      title: 'AGENCY COMMUNICATIONS',
      subtitle: 'Inter-agency coordination, broadcast alerts & live command channel',
    },
    reports: {
      title: 'SITUATION REPORTS (SITREP)',
      subtitle: 'National NDMA-compliant operational summaries & automated reporting',
    },
    analytics: {
      title: 'ANALYTICS & PERFORMANCE',
      subtitle: 'Response SLAs, agency efficiency metrics & historical trends',
    },
    admin: {
      title: 'SYSTEM ADMINISTRATION',
      subtitle: 'Daemon health, security posture, RBAC access & database maintenance',
    },
  };

  const currentHeader = PAGE_TITLES[activeTab] || {
    title: 'OPERATIONAL COMMAND',
    subtitle: 'Strategic Agent-Based Victim Evacuation',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080F1B] text-[#F1F5F9] font-sans select-none">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        activeIncidentsCount={incidents.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Command Bar */}
        <TopBar
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          dbConnected={dbConnected}
          n8nConnected={n8nConnected}
          isRefreshing={isRefreshing}
          onRefresh={loadAllData}
          onSyncLiveFeed={handleSyncLiveFeed}
          isSyncingFeed={isSyncingFeed}
          currentUser={currentUser}
          notificationCount={pendingApprovalsCount}
        />

        {/* Dynamic Reconstructed Views */}
        <main className="flex-1 overflow-y-auto relative flex flex-col min-h-0 bg-[#080F1B]">
          {/* SCREEN 01: COMMAND CENTRE */}
          {activeTab === 'dashboard' && (
            <CommandCentreView
              incidents={incidents}
              hospitals={hospitals}
              ambulances={ambulances}
              rescueTeams={rescueTeams}
              shelters={shelters}
              routes={routes}
              riskZones={riskZones}
              roadClosures={roadClosures}
              selectedIncident={selectedIncident}
              onSelectIncident={(inc) => {
                setSelectedIncident(inc);
                if (routes.length === 0) handleTriggerResponse(inc.id);
              }}
              onTriggerResponse={handleTriggerResponse}
              onViewPlan={(plan) => setIsPlanOpen(true)}
              onOpenSosModal={() => setIsSosOpen(true)}
              onClearIncidents={handleClearIncidents}
              responsePlan={responsePlan}
              loadingIncidentId={loadingIncidentId}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* SCREEN 02: INCIDENT MANAGEMENT & SOS */}
          {activeTab === 'incidents' && (
            <IncidentManagementView
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              onTriggerResponse={handleTriggerResponse}
              onOpenSosModal={() => setIsSosOpen(true)}
              onRefresh={loadAllData}
              loadingIncidentId={loadingIncidentId}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* SCREEN 03: LIVE OPERATIONS MAP */}
          {activeTab === 'map' && (
            <LiveOperationsMapView
              incidents={incidents}
              hospitals={hospitals}
              ambulances={ambulances}
              rescueTeams={rescueTeams}
              shelters={shelters}
              routes={routes}
              riskZones={riskZones}
              roadClosures={roadClosures}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* SCREEN 04: AI AGENT CONTROL ROOM */}
          {activeTab === 'agents' && (
            <AgentControlRoomView
              agentsStatus={agentsStatus}
              agentRuns={agentRuns}
              onTriggerDemo={handleTriggerEarthquakeDemo}
              isDemoRunning={isDemoRunning}
            />
          )}

          {/* SCREEN 05: AGENT EXECUTION TRACES */}
          {activeTab === 'traces' && (
            <AgentExecutionTracesView agentRuns={agentRuns} onRefresh={loadAllData} />
          )}

          {/* SCREEN 06: APPROVAL CENTRE */}
          {activeTab === 'approvals' && (
            <ApprovalCentreView onRefreshAll={loadAllData} />
          )}

          {/* SCREEN 07: HOSPITAL NETWORK */}
          {activeTab === 'hospitals' && (
            <HospitalNetworkView hospitals={hospitals} onRefresh={loadAllData} />
          )}

          {/* SCREEN 08: FLEET & DISPATCH */}
          {activeTab === 'dispatch' && (
            <FleetDispatchView
              ambulances={ambulances}
              incidents={incidents}
              onRefresh={loadAllData}
            />
          )}

          {/* SCREEN 09: RESCUE OPERATIONS */}
          {activeTab === 'rescue' && (
            <RescueOperationsView rescueTeams={rescueTeams} onRefresh={loadAllData} />
          )}

          {/* SCREEN 10: MEDICAL LOGISTICS */}
          {activeTab === 'medical' && <MedicalLogisticsView />}

          {/* SCREEN 11: EVACUATION & SHELTERS */}
          {activeTab === 'shelters' && (
            <EvacuationSheltersView
              shelters={shelters}
              incidents={incidents}
              onRefresh={loadAllData}
            />
          )}

          {/* SCREEN 12: AGENCY COMMUNICATIONS */}
          {activeTab === 'communication' && (
            <AgencyCommunicationsView
              contacts={contacts}
              messages={messages}
              onRefresh={loadAllData}
            />
          )}

          {/* SCREEN 13: SITUATION REPORTS */}
          {activeTab === 'reports' && (
            <SituationReportsView
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
            />
          )}

          {/* DISASTER SCENARIO SIMULATOR */}
          {activeTab === 'simulator' && (
            <DisasterSimulatorView
              onTriggerDemo={handleTriggerEarthquakeDemo}
              onViewPlan={() => setIsPlanOpen(true)}
              isDemoRunning={isDemoRunning}
            />
          )}

          {/* ANALYTICS & PERFORMANCE */}
          {activeTab === 'analytics' && <AnalyticsPerformanceView />}

          {/* SYSTEM ADMINISTRATION */}
          {activeTab === 'admin' && (
            <SystemAdministrationView
              onRefreshAll={loadAllData}
              onClearIncidents={handleClearIncidents}
              dbConnected={dbConnected}
              incidentCount={incidents.length}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SosReportModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onSubmit={handleReportSos}
      />

      <WhatIfModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
      />

      <ResponsePlanModal
        isOpen={isPlanOpen}
        onClose={() => setIsPlanOpen(false)}
        plan={responsePlan}
        onPlanApproved={() => {
          setIsPlanOpen(false);
          loadAllData();
        }}
      />
    </div>
  );
};
