import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCallSchema, insertAssistantSchema, insertVoiceAgentSchema, insertCampaignSchema } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication API Routes
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user by email (using email as username for login)
      const user = await storage.getUserByUsername(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // In a real app, you'd verify the password hash here
      // For now, we'll do a simple comparison (not secure for production)
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token: `user_${user.id}` // Simple token for demo
      });

    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Create new user
      const newUser = await storage.createUser({
        username,
        email,
        password // In production, hash this password
      });

      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({
        user: userWithoutPassword,
        token: `user_${newUser.id}`
      });

    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/signout", async (req, res) => {
    // In a real app, you'd invalidate the token here
    res.json({ success: true });
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.substring(7);
      const userId = token.replace('user_', '');

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });

    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Voice Agent API Routes
  app.get("/api/voice-agents", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      const agents = await storage.getVoiceAgents(userId);
      res.json(agents);
    } catch (error) {
      console.error("Error fetching voice agents:", error);
      res.status(500).json({ error: "Failed to fetch voice agents" });
    }
  });

  app.post("/api/voice-agents", async (req, res) => {
    try {
      const validatedData = insertVoiceAgentSchema.parse(req.body);
      const agent = await storage.createVoiceAgent(validatedData);
      res.json(agent);
    } catch (error) {
      console.error("Error creating voice agent:", error);
      res.status(500).json({ error: "Failed to create voice agent" });
    }
  });

  // Assistant API Routes
  app.get("/api/assistants", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const assistants = await storage.getAssistants(userId);
      res.json(assistants);
    } catch (error) {
      console.error("Error fetching assistants:", error);
      res.status(500).json({ error: "Failed to fetch assistants" });
    }
  });

  app.post("/api/assistants", async (req, res) => {
    try {
      const validatedData = insertAssistantSchema.parse(req.body);
      const assistant = await storage.createAssistant(validatedData);
      res.json(assistant);
    } catch (error) {
      console.error("Error creating assistant:", error);
      res.status(500).json({ error: "Failed to create assistant" });
    }
  });

  // Calls API Routes
  app.get("/api/calls", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const calls = await storage.getCalls(userId, limit, offset);
      res.json(calls);
    } catch (error) {
      console.error("Error fetching calls:", error);
      res.status(500).json({ error: "Failed to fetch calls" });
    }
  });

  // Make Call API Route (migrated from Supabase Edge Function)
  app.post("/api/make-call", async (req, res) => {
    try {
      const { to, callId, campaignId, scriptId } = req.body;

      if (!to || !callId) {
        return res.status(400).json({ error: "Missing required parameters: to, callId" });
      }

      // Get SignalWire credentials from environment
      const signalwireProjectId = process.env.SIGNALWIRE_PROJECT_ID;
      const signalwireToken = process.env.SIGNALWIRE_TOKEN;
      const signalwireSpace = process.env.SIGNALWIRE_SPACE;
      const signalwirePhoneNumber = process.env.SIGNALWIRE_PHONE_NUMBER;

      if (!signalwireProjectId || !signalwireToken || !signalwireSpace || !signalwirePhoneNumber) {
        return res.status(500).json({ error: "SignalWire credentials not configured" });
      }

      // Create TwiML for AI agent
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Stream url="wss://${req.get('host')}/ws/call/${callId}">
            <Parameter name="callId" value="${callId}" />
            <Parameter name="campaignId" value="${campaignId}" />
            <Parameter name="scriptId" value="${scriptId}" />
          </Stream>
        </Connect>
      </Response>`;

      // Make SignalWire API call
      const response = await fetch(`https://${signalwireSpace}.signalwire.com/api/laml/2010-04-01/Accounts/${signalwireProjectId}/Calls.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${signalwireProjectId}:${signalwireToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: signalwirePhoneNumber,
          Twiml: twiml,
          StatusCallback: `https://${req.get('host')}/api/call-status`,
          StatusCallbackEvent: 'initiated,ringing,answered,completed',
          StatusCallbackMethod: 'POST'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SignalWire API error: ${error}`);
      }

      const callData = await response.json();

      // Update call in database with SignalWire call ID
      await storage.updateCall(callId, {
        signalwireCallId: callData.sid,
        status: 'connecting'
      });

      res.json({
        success: true,
        call_sid: callData.sid
      });

    } catch (error) {
      console.error('Make call error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // SignalWire Webhook Route (migrated from Supabase Edge Function)
  app.post("/api/signalwire-webhook", async (req, res) => {
    try {
      const { CallSid, CallStatus, From, To } = req.body;

      if (!CallSid) {
        return res.status(400).json({ error: "Missing CallSid" });
      }

      // Find call by SignalWire call ID
      const calls = await storage.getCalls();
      const call = calls.find(c => c.signalwireCallId === CallSid);

      if (call) {
        // Update call status
        await storage.updateCall(call.id, {
          status: CallStatus?.toLowerCase() || 'unknown'
        });
      }

      res.json({ success: true });

    } catch (error) {
      console.error('SignalWire webhook error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Call Status Webhook Route
  app.post("/api/call-status", async (req, res) => {
    try {
      const { CallSid, CallStatus } = req.body;

      if (!CallSid) {
        return res.status(400).json({ error: "Missing CallSid" });
      }

      // Find and update call by SignalWire call ID
      const calls = await storage.getCalls();
      const call = calls.find(c => c.signalwireCallId === CallSid);

      if (call) {
        await storage.updateCall(call.id, {
          status: CallStatus?.toLowerCase() || 'unknown'
        });
      }

      res.json({ success: true });

    } catch (error) {
      console.error('Call status webhook error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Make Outbound Call API Route (migrated from Supabase Edge Function)
  app.post("/api/make-outbound-call", async (req, res) => {
    try {
      const { assistantId, phoneNumber, userId } = req.body;

      if (!assistantId || !phoneNumber) {
        return res.status(400).json({ error: "Assistant ID and phone number are required" });
      }

      // Get assistant configuration
      const assistant = await storage.getAssistant(assistantId);
      if (!assistant) {
        return res.status(404).json({ error: "Assistant not found" });
      }

      // Get SignalWire credentials
      const signalwireProjectId = process.env.SIGNALWIRE_PROJECT_ID;
      const signalwireToken = process.env.SIGNALWIRE_TOKEN;
      const signalwireSpace = process.env.SIGNALWIRE_SPACE;
      const signalwirePhoneNumber = process.env.SIGNALWIRE_PHONE_NUMBER;

      if (!signalwireProjectId || !signalwireToken || !signalwireSpace || !signalwirePhoneNumber) {
        return res.status(500).json({ error: "SignalWire configuration missing" });
      }

      // Create greeting message
      const greeting = assistant.firstMessage || `Hello! This is ${assistant.name}, an AI assistant. How can I help you today?`;

      // Create TwiML for the call
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">${greeting}</Say>
        <Connect>
          <Stream url="wss://${req.get('host')}/ws/voice-agent/${assistantId}" />
        </Connect>
      </Response>`;

      // Make the outbound call
      const response = await fetch(`https://${signalwireSpace}.signalwire.com/api/laml/2010-04-01/Accounts/${signalwireProjectId}/Calls.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${signalwireProjectId}:${signalwireToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: signalwirePhoneNumber,
          Twiml: twiml,
          StatusCallback: `https://${req.get('host')}/api/signalwire-webhook?assistantId=${assistantId}`,
          StatusCallbackMethod: 'POST'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SignalWire API error: ${response.status} ${error}`);
      }

      const callData = await response.json();

      // Create call record
      const newCall = await storage.createCall({
        assistantId: assistantId,
        userId: userId,
        phoneNumber: phoneNumber,
        status: 'initiated',
        signalwireCallId: callData.sid,
        analytics: {
          assistantName: assistant.name,
          assistantModel: assistant.model,
          voiceId: assistant.voiceId,
          direction: 'outbound'
        }
      });

      res.json({
        success: true,
        call_sid: callData.sid,
        call_id: newCall.id,
        assistant_name: assistant.name,
        phone_number: phoneNumber,
        message: `Call initiated with ${assistant.name}`
      });

    } catch (error) {
      console.error('Outbound call error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Campaigns API Routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const campaigns = await storage.getCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  // Contacts API Routes
  app.get("/api/contacts", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      const contacts = await storage.getContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  // Agent Flows API Routes
  app.get("/api/agent-flows", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      const flows = await storage.getAgentFlows(userId);
      res.json(flows);
    } catch (error) {
      console.error("Error fetching agent flows:", error);
      res.status(500).json({ error: "Failed to fetch agent flows" });
    }
  });

  // Teams API Routes
  app.get("/api/teams", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      const teams = await storage.getTeams(userId);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
