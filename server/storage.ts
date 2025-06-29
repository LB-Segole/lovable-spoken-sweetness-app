import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  voiceAgents,
  assistants,
  campaigns,
  calls,
  contacts,
  agentFlows,
  teams,
  callLogs,
  type User,
  type InsertUser,
  type VoiceAgent,
  type InsertVoiceAgent,
  type Assistant,
  type InsertAssistant,
  type Campaign,
  type InsertCampaign,
  type Call,
  type InsertCall,
  type Contact,
  type InsertContact,
  type AgentFlow,
  type InsertAgentFlow,
  type Team,
  type InsertTeam,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Voice agent operations
  getVoiceAgents(userId: string): Promise<VoiceAgent[]>;
  getVoiceAgent(id: string): Promise<VoiceAgent | undefined>;
  createVoiceAgent(agent: InsertVoiceAgent): Promise<VoiceAgent>;
  updateVoiceAgent(id: string, agent: Partial<InsertVoiceAgent>): Promise<VoiceAgent | undefined>;
  deleteVoiceAgent(id: string): Promise<boolean>;
  
  // Assistant operations
  getAssistants(userId?: string): Promise<Assistant[]>;
  getAssistant(id: string): Promise<Assistant | undefined>;
  createAssistant(assistant: InsertAssistant): Promise<Assistant>;
  updateAssistant(id: string, assistant: Partial<InsertAssistant>): Promise<Assistant | undefined>;
  deleteAssistant(id: string): Promise<boolean>;
  
  // Campaign operations
  getCampaigns(userId?: string): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<boolean>;
  
  // Call operations
  getCalls(userId?: string, limit?: number, offset?: number): Promise<Call[]>;
  getCall(id: string): Promise<Call | undefined>;
  createCall(call: InsertCall): Promise<Call>;
  updateCall(id: string, call: Partial<InsertCall>): Promise<Call | undefined>;
  deleteCall(id: string): Promise<boolean>;
  
  // Contact operations
  getContacts(userId: string): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;
  
  // Agent flow operations
  getAgentFlows(userId: string): Promise<AgentFlow[]>;
  getAgentFlow(id: string): Promise<AgentFlow | undefined>;
  createAgentFlow(flow: InsertAgentFlow): Promise<AgentFlow>;
  updateAgentFlow(id: string, flow: Partial<InsertAgentFlow>): Promise<AgentFlow | undefined>;
  deleteAgentFlow(id: string): Promise<boolean>;
  
  // Team operations
  getTeams(userId: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Voice agent operations
  async getVoiceAgents(userId: string): Promise<VoiceAgent[]> {
    return await db.select().from(voiceAgents).where(eq(voiceAgents.userId, userId));
  }

  async getVoiceAgent(id: string): Promise<VoiceAgent | undefined> {
    const result = await db.select().from(voiceAgents).where(eq(voiceAgents.id, id));
    return result[0];
  }

  async createVoiceAgent(agent: InsertVoiceAgent): Promise<VoiceAgent> {
    const result = await db.insert(voiceAgents).values(agent).returning();
    return result[0];
  }

  async updateVoiceAgent(id: string, agent: Partial<InsertVoiceAgent>): Promise<VoiceAgent | undefined> {
    const result = await db.update(voiceAgents).set(agent).where(eq(voiceAgents.id, id)).returning();
    return result[0];
  }

  async deleteVoiceAgent(id: string): Promise<boolean> {
    const result = await db.delete(voiceAgents).where(eq(voiceAgents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Assistant operations
  async getAssistants(userId?: string): Promise<Assistant[]> {
    if (userId) {
      return await db.select().from(assistants).where(eq(assistants.userId, userId));
    }
    return await db.select().from(assistants);
  }

  async getAssistant(id: string): Promise<Assistant | undefined> {
    const result = await db.select().from(assistants).where(eq(assistants.id, id));
    return result[0];
  }

  async createAssistant(assistant: InsertAssistant): Promise<Assistant> {
    const result = await db.insert(assistants).values(assistant).returning();
    return result[0];
  }

  async updateAssistant(id: string, assistant: Partial<InsertAssistant>): Promise<Assistant | undefined> {
    const result = await db.update(assistants).set(assistant).where(eq(assistants.id, id)).returning();
    return result[0];
  }

  async deleteAssistant(id: string): Promise<boolean> {
    const result = await db.delete(assistants).where(eq(assistants.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Campaign operations
  async getCampaigns(userId?: string): Promise<Campaign[]> {
    if (userId) {
      return await db.select().from(campaigns).where(eq(campaigns.userId, userId));
    }
    return await db.select().from(campaigns);
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const result = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return result[0];
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const result = await db.insert(campaigns).values(campaign).returning();
    return result[0];
  }

  async updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const result = await db.update(campaigns).set(campaign).where(eq(campaigns.id, id)).returning();
    return result[0];
  }

  async deleteCampaign(id: string): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Call operations
  async getCalls(userId?: string, limit: number = 50, offset: number = 0): Promise<Call[]> {
    if (userId) {
      return await db.select().from(calls).where(eq(calls.userId, userId)).limit(limit).offset(offset);
    }
    return await db.select().from(calls).limit(limit).offset(offset);
  }

  async getCall(id: string): Promise<Call | undefined> {
    const result = await db.select().from(calls).where(eq(calls.id, id));
    return result[0];
  }

  async createCall(call: InsertCall): Promise<Call> {
    const result = await db.insert(calls).values(call).returning();
    return result[0];
  }

  async updateCall(id: string, call: Partial<InsertCall>): Promise<Call | undefined> {
    const result = await db.update(calls).set(call).where(eq(calls.id, id)).returning();
    return result[0];
  }

  async deleteCall(id: string): Promise<boolean> {
    const result = await db.delete(calls).where(eq(calls.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Contact operations
  async getContacts(userId: string): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.userId, userId));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id));
    return result[0];
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(contact).returning();
    return result[0];
  }

  async updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    const result = await db.update(contacts).set(contact).where(eq(contacts.id, id)).returning();
    return result[0];
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Agent flow operations
  async getAgentFlows(userId: string): Promise<AgentFlow[]> {
    return await db.select().from(agentFlows).where(eq(agentFlows.userId, userId));
  }

  async getAgentFlow(id: string): Promise<AgentFlow | undefined> {
    const result = await db.select().from(agentFlows).where(eq(agentFlows.id, id));
    return result[0];
  }

  async createAgentFlow(flow: InsertAgentFlow): Promise<AgentFlow> {
    const result = await db.insert(agentFlows).values(flow).returning();
    return result[0];
  }

  async updateAgentFlow(id: string, flow: Partial<InsertAgentFlow>): Promise<AgentFlow | undefined> {
    const result = await db.update(agentFlows).set(flow).where(eq(agentFlows.id, id)).returning();
    return result[0];
  }

  async deleteAgentFlow(id: string): Promise<boolean> {
    const result = await db.delete(agentFlows).where(eq(agentFlows.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Team operations
  async getTeams(userId: string): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.ownerId, userId));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const result = await db.select().from(teams).where(eq(teams.id, id));
    return result[0];
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const result = await db.insert(teams).values(team).returning();
    return result[0];
  }

  async updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined> {
    const result = await db.update(teams).set(team).where(eq(teams.id, id)).returning();
    return result[0];
  }

  async deleteTeam(id: string): Promise<boolean> {
    const result = await db.delete(teams).where(eq(teams.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
