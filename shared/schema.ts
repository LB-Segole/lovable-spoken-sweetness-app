import { pgTable, text, serial, integer, boolean, timestamp, uuid, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// User profiles table
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  phone: text("phone"),
  timezone: text("timezone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  billingEmail: text("billing_email"),
  ownerId: uuid("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members table
export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Voice agents table
export const voiceAgents = pgTable("voice_agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  voiceId: text("voice_id"),
  voiceProvider: text("voice_provider"),
  model: text("model").default("gpt-4"),
  temperature: numeric("temperature").default("0.7"),
  maxTokens: integer("max_tokens").default(1000),
  userId: uuid("user_id").references(() => users.id).notNull(),
  teamId: uuid("team_id").references(() => teams.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assistants table
export const assistants = pgTable("assistants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  firstMessage: text("first_message"),
  voiceId: text("voice_id"),
  voiceProvider: text("voice_provider"),
  model: text("model").default("gpt-4"),
  temperature: numeric("temperature").default("0.7"),
  maxTokens: integer("max_tokens").default(1000),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("draft"),
  scriptId: uuid("script_id"),
  totalCalls: integer("total_calls").default(0),
  completedCalls: integer("completed_calls").default(0),
  successRate: numeric("success_rate"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  customFields: jsonb("custom_fields"),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calls table
export const calls = pgTable("calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  phoneNumber: text("phone_number"),
  assistantId: uuid("assistant_id").references(() => assistants.id),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
  contactId: uuid("contact_id").references(() => contacts.id),
  status: text("status").default("pending"),
  duration: integer("duration"),
  callCost: numeric("call_cost"),
  transcript: text("transcript"),
  recordingUrl: text("recording_url"),
  callSummary: text("call_summary"),
  successScore: numeric("success_score"),
  analytics: jsonb("analytics"),
  signalwireCallId: text("signalwire_call_id"),
  externalId: text("external_id"),
  intentMatched: text("intent_matched"),
  transferReason: text("transfer_reason"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  endedAt: timestamp("ended_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Call logs table for detailed conversation tracking
export const callLogs = pgTable("call_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  callId: uuid("call_id").references(() => calls.id),
  speaker: text("speaker").notNull(),
  content: text("content").notNull(),
  confidence: numeric("confidence"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Agent flows table
export const agentFlows = pgTable("agent_flows", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  flowData: jsonb("flow_data").notNull(),
  isActive: boolean("is_active").default(true),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent chains table
export const agentChains = pgTable("agent_chains", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  configuration: jsonb("configuration").notNull(),
  isActive: boolean("is_active").default(true),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chain steps table
export const chainSteps = pgTable("chain_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  chainId: uuid("chain_id").references(() => agentChains.id).notNull(),
  stepOrder: integer("step_order").notNull(),
  agentId: uuid("agent_id").references(() => assistants.id),
  flowId: uuid("flow_id").references(() => agentFlows.id),
  conditions: jsonb("conditions"),
  timeoutSeconds: integer("timeout_seconds"),
  fallbackStepId: uuid("fallback_step_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chain executions table
export const chainExecutions = pgTable("chain_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  chainId: uuid("chain_id").references(() => agentChains.id).notNull(),
  callId: uuid("call_id").references(() => calls.id),
  status: text("status").default("pending"),
  currentStepId: uuid("current_step_id").references(() => chainSteps.id),
  executionLog: jsonb("execution_log"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Agent templates table
export const agentTemplates = pgTable("agent_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  templateData: jsonb("template_data").notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  teamId: uuid("team_id").references(() => teams.id),
  isPublic: boolean("is_public").default(false),
  downloadsCount: integer("downloads_count").default(0),
  ratingAverage: numeric("rating_average"),
  ratingCount: integer("rating_count").default(0),
  tags: text("tags").array(),
  version: text("version"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider keys table for API credentials
export const providerKeys = pgTable("provider_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  provider: text("provider").notNull(),
  keyName: text("key_name").notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  plan: text("plan").notNull(),
  status: text("status").notNull(),
  subscriptionTier: text("subscription_tier"),
  subscriptionEnd: timestamp("subscription_end"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  metadata: jsonb("metadata"),
  teamId: uuid("team_id").references(() => teams.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertVoiceAgentSchema = createInsertSchema(voiceAgents).pick({
  name: true,
  description: true,
  systemPrompt: true,
  voiceId: true,
  voiceProvider: true,
  model: true,
  temperature: true,
  maxTokens: true,
  userId: true,
  teamId: true,
  isActive: true,
});

export const insertAssistantSchema = createInsertSchema(assistants).pick({
  name: true,
  systemPrompt: true,
  firstMessage: true,
  voiceId: true,
  voiceProvider: true,
  model: true,
  temperature: true,
  maxTokens: true,
  userId: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  description: true,
  status: true,
  scriptId: true,
  totalCalls: true,
  completedCalls: true,
  successRate: true,
  userId: true,
});

export const insertCallSchema = createInsertSchema(calls).pick({
  phoneNumber: true,
  assistantId: true,
  campaignId: true,
  contactId: true,
  status: true,
  duration: true,
  callCost: true,
  transcript: true,
  recordingUrl: true,
  callSummary: true,
  successScore: true,
  analytics: true,
  signalwireCallId: true,
  externalId: true,
  intentMatched: true,
  transferReason: true,
  userId: true,
  completedAt: true,
  endedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  phoneNumber: true,
  email: true,
  campaignId: true,
  customFields: true,
  userId: true,
});

export const insertAgentFlowSchema = createInsertSchema(agentFlows).pick({
  name: true,
  description: true,
  flowData: true,
  isActive: true,
  userId: true,
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  description: true,
  billingEmail: true,
  ownerId: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVoiceAgent = z.infer<typeof insertVoiceAgentSchema>;
export type VoiceAgent = typeof voiceAgents.$inferSelect;

export type InsertAssistant = z.infer<typeof insertAssistantSchema>;
export type Assistant = typeof assistants.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof calls.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertAgentFlow = z.infer<typeof insertAgentFlowSchema>;
export type AgentFlow = typeof agentFlows.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
