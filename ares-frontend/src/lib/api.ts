/**
 * SAVE API Client & Type Definitions
 * Connects React Frontend to FastAPI Async Backend
 */

export interface Incident {
  id: string;
  name?: string;
  disaster_type: string;
  severity: number;
  status: 'REPORTED' | 'VERIFIED' | 'RESPONSE_PLANNED' | 'APPROVED' | 'RESOLVED';
  location_lat: number;
  location_lng: number;
  address?: string;
  estimated_casualties?: number;
  source?: string;
  created_at?: string;
  updated_at?: string;
  verification_status?: string;
  danger_radius_km?: number;
}

export interface Hospital {
  id: string;
  name: string;
  address?: string;
  total_beds: number;
  available_beds: number;
  icu_beds?: number;
  icu_available: number;
  ventilators?: number;
  ventilators_available: number;
  phone?: string;
  latitude: number;
  longitude: number;
  specialties?: string[];
  status?: string;
}

export interface Ambulance {
  id: string;
  vehicle_number: string;
  vehicle_type: 'ALS' | 'BLS';
  status: 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE' | 'RETURNING' | 'MAINTENANCE';
  assigned_incident_id?: string;
  base_location?: string;
  latitude: number;
  longitude: number;
  fuel_level_pct?: number;
  eta_minutes?: number;
}

export interface RescueTeam {
  id: string;
  team_name: string;
  team_type: 'USAR' | 'SDRF' | 'FIRE_BRIGADE' | 'CIVIL_DEFENCE' | 'MEDICAL_RESCUE';
  unit_size: number;
  status: 'AVAILABLE' | 'DEPLOYED' | 'EN_ROUTE' | 'RESCUING' | 'STANDBY';
  assigned_incident_id?: string;
  base_location?: string;
  latitude: number;
  longitude: number;
  people_rescued?: number;
}

export interface RescueMission {
  id: string;
  incident_id: string;
  team_id: string;
  mission_name?: string;
  status: string;
  people_rescued?: number;
  trapped_count?: number;
  created_at?: string;
}

export interface Shelter {
  id: string;
  name: string;
  address?: string;
  capacity: number;
  current_occupancy: number;
  latitude: number;
  longitude: number;
  status?: string;
  is_active?: boolean;
}

export interface MedicalSupplyItem {
  id: string;
  item_name: string;
  category: string;
  current_stock: number;
  minimum_threshold: number;
  unit: string;
  warehouse_location?: string;
}

export interface AgentStatus {
  name: string;
  type: string;
  status: string;
  last_confidence: number;
  description: string;
  total_executions?: number;
  avg_response_time?: number;
}

export interface AgentRun {
  id: string;
  incident_id: string;
  agent_name: string;
  agent_type: string;
  task: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED' | 'PENDING';
  input_data?: any;
  output_data?: any;
  recommendation?: string;
  confidence?: number;
  started_at?: string;
  completed_at?: string;
}

export interface Approval {
  id: string;
  incident_id: string;
  action_type: string;
  action_description: string;
  proposed_by: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decided_by?: string;
  decision_notes?: string;
  created_at: string;
  decided_at?: string;
  resource_summary?: {
    ambulances?: number;
    rescue_teams?: number;
    hospitals?: number;
    casualties?: number;
  };
}

export interface EmergencyContact {
  agency_code: string;
  agency_name: string;
  phone: string;
  description?: string;
  role?: string;
}

export interface AgencyMessage {
  id: string;
  agency_code: string;
  incident_id?: string;
  subject: string;
  body: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'QUEUED' | 'TRANSMITTED' | 'DELIVERED_ACKNOWLEDGED';
  is_simulation: boolean;
  ack_latency_seconds?: number;
  responder_ack_badge?: string;
  created_at?: string;
}

export interface SituationReportData {
  sitrep_number: string;
  incident_id: string;
  generated_at: string;
  disaster_type: string;
  severity: number;
  executive_summary: string;
  content_markdown: string;
  target_authorities?: string[];
  metrics?: {
    casualties?: number;
    evacuated?: number;
    ambulances?: number;
    rescue_teams?: number;
    hospitals?: number;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

const API_BASE = '/api/v1';

// Token storage helpers
export const getAuthToken = (): string | null => {
  return localStorage.getItem('ares_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('ares_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('ares_token');
};

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    let errorDetail = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch (_) { }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const aresApi = {
  // Health & Verification
  getHealth: () => fetchApi<{ status: string; database?: string; timestamp?: string }>('/health'),

  // Auth & RBAC
  login: (data: { email: string; password: string }) =>
    fetchApi<{ access_token: string; role: string; full_name: string; user_id: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: { email: string; password: string; full_name: string; role?: string }) =>
    fetchApi<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchApi<UserProfile>('/auth/me'),

  // Incidents & SOS
  getIncidents: (status?: string) =>
    fetchApi<Incident[]>(status && status !== 'ALL' ? `/incidents/?status=${status}` : '/incidents/'),
  getIncidentDetail: (id: string) => fetchApi<Incident>(`/incidents/${id}`),
  reportIncident: (data: Partial<Incident>) =>
    fetchApi<Incident>('/incidents/', { method: 'POST', body: JSON.stringify(data) }),
  clearAllIncidents: () => fetchApi<any>('/incidents/clear-all', { method: 'DELETE' }),
  deleteIncident: (id: string) => fetchApi<any>(`/incidents/${id}`, { method: 'DELETE' }),
  updateIncidentStatus: (id: string, status: string, notes?: string) =>
    fetchApi<any>(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, decision_notes: notes }),
    }),
  triggerMultiAgentResponse: (incidentId: string) =>
    fetchApi<any>(`/incidents/${incidentId}/trigger-response`, { method: 'POST' }),
  getIncidentTimeline: (incidentId: string) => fetchApi<any[]>(`/incidents/${incidentId}/timeline`),

  // Hospitals Network
  getHospitals: () => fetchApi<Hospital[]>('/hospitals/'),
  updateHospitalCapacity: (
    id: string,
    data: { available_beds?: number; icu_available?: number; ventilators_available?: number }
  ) => fetchApi<Hospital>(`/hospitals/${id}/capacity`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Fleet & Ambulance Dispatch
  getAmbulances: (status?: string) =>
    fetchApi<Ambulance[]>(status && status !== 'ALL' ? `/ambulances/?status=${status}` : '/ambulances/'),
  dispatchAmbulance: (id: string, incidentId: string) =>
    fetchApi<any>(`/ambulances/${id}/dispatch?incident_id=${incidentId}`, { method: 'POST' }),

  // Rescue Operations
  getRescueTeams: () => fetchApi<RescueTeam[]>('/rescue/teams'),
  getRescueMissions: () => fetchApi<RescueMission[]>('/rescue/missions'),

  // Medical Logistics
  getMedicalInventory: () => fetchApi<MedicalSupplyItem[]>('/medical/inventory'),
  getMedicalRequirements: (disasterType: string, count = 15) =>
    fetchApi<any>(`/medical/requirements/${disasterType}?patient_count=${count}`),
  createSupplyRequest: (data: { item_name: string; category: string; quantity: number; hospital_id?: string; priority?: string }) =>
    fetchApi<any>('/medical/requests', { method: 'POST', body: JSON.stringify(data) }),

  // Agency Communications (112 ERSS)
  getEmergencyContacts: () => fetchApi<EmergencyContact[]>('/communication/contacts'),
  getAgencyMessages: (incidentId?: string) =>
    fetchApi<AgencyMessage[]>(incidentId ? `/communication/messages?incident_id=${incidentId}` : '/communication/messages'),
  sendAgencyMessage: (data: Partial<AgencyMessage>) =>
    fetchApi<AgencyMessage>('/communication/messages', { method: 'POST', body: JSON.stringify(data) }),
  acknowledgeMessage: (id: string) =>
    fetchApi<any>(`/communication/messages/${id}/ack`, { method: 'PATCH' }),
  broadcastAlert: (subject: string, body: string, priority = 'CRITICAL') =>
    fetchApi<any>(
      `/communication/broadcast?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&priority=${priority}`,
      { method: 'POST' }
    ),

  // AI Agent Control Room & Execution Traces
  getAgentsStatus: () => fetchApi<AgentStatus[]>('/agents/status'),
  getAgentRuns: (incidentId?: string) =>
    fetchApi<AgentRun[]>(incidentId ? `/agents/runs?incident_id=${incidentId}` : '/agents/runs'),

  // Approval Centre (Human-in-the-Loop)
  getApprovals: (status?: string) =>
    fetchApi<Approval[]>(status && status !== 'ALL' ? `/approvals/?status=${status}` : '/approvals/'),
  decideApproval: (id: string, action: 'APPROVE' | 'REJECT', notes?: string) =>
    fetchApi<any>(`/approvals/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ action, decision_notes: notes }),
    }),

  // Evacuation & Shelters
  getShelters: () => fetchApi<Shelter[]>('/shelters/'),

  // Situation Reports (SITREP) & Analytics
  getAnalytics: () => fetchApi<any>('/reports/analytics'),
  getSituationReport: (incidentId: string) => fetchApi<SituationReportData>(`/reports/situation/${incidentId}`),

  // Disaster Simulator & Scenarios
  runWhatIf: (scenarioType: string, target?: string) =>
    fetchApi<any>('/simulation/what-if', {
      method: 'POST',
      body: JSON.stringify({ scenario_type: scenarioType, target_entity: target }),
    }),
  triggerEarthquakeDemo: () => fetchApi<any>('/simulation/demo/earthquake', { method: 'POST' }),
};
