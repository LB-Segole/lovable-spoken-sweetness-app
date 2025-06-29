
// API Client for Express Backend
const API_BASE_URL = '/api';

// API helper functions to replace Supabase calls
export const apiClient = {
  // Generic API call helper
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  // Voice Agents
  async getVoiceAgents(userId: string) {
    return this.request(`/voice-agents?userId=${userId}`);
  },

  async createVoiceAgent(agent: any) {
    return this.request('/voice-agents', {
      method: 'POST',
      body: JSON.stringify(agent),
    });
  },

  // Assistants
  async getAssistants(userId?: string) {
    const query = userId ? `?userId=${userId}` : '';
    return this.request(`/assistants${query}`);
  },

  async createAssistant(assistant: any) {
    return this.request('/assistants', {
      method: 'POST',
      body: JSON.stringify(assistant),
    });
  },

  // Calls
  async getCalls(userId?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.request(`/calls?${params}`);
  },

  async makeCall(callData: any) {
    return this.request('/make-call', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
  },

  async makeOutboundCall(callData: any) {
    return this.request('/make-outbound-call', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
  },

  // Campaigns
  async getCampaigns(userId?: string) {
    const query = userId ? `?userId=${userId}` : '';
    return this.request(`/campaigns${query}`);
  },

  async createCampaign(campaign: any) {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  },

  // Contacts
  async getContacts(userId: string) {
    return this.request(`/contacts?userId=${userId}`);
  },

  // Agent Flows
  async getAgentFlows(userId: string) {
    return this.request(`/agent-flows?userId=${userId}`);
  },

  // Teams
  async getTeams(userId: string) {
    return this.request(`/teams?userId=${userId}`);
  },
};

// Real-time updates can be implemented using WebSocket connections
// For now, we'll use polling or Server-Sent Events as a replacement
export const subscribeToCallUpdates = (callId: string, callback: (data: any) => void) => {
  // TODO: Implement WebSocket subscription or polling for call updates
  console.log('Real-time call updates not yet implemented for:', callId);
  return { unsubscribe: () => {} };
};

export const subscribeToActiveCallsUpdates = (userId: string, callback: (data: any) => void) => {
  // TODO: Implement WebSocket subscription or polling for active calls
  console.log('Real-time active calls updates not yet implemented for:', userId);
  return { unsubscribe: () => {} };
};

// Legacy exports for backward compatibility
export const supabase = null;
export const supabaseAdmin = null;
