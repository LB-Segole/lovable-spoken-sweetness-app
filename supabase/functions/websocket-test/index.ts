// deno-lint-ignore-file
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

console.log('WebSocket Test Function - Starting...');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade, connection',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, UPGRADE',
};

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  
  console.log(`[${requestId}] === NEW REQUEST START ===`);
  console.log(`[${requestId}] Method: ${req.method}, URL: ${req.url}`);
  
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      console.log(`[${requestId}] CORS preflight handled`);
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Handle health check
    const url = new URL(req.url);
    if (url.pathname === '/health' || req.method === 'GET') {
      console.log(`[${requestId}] Health check requested`);
      return new Response(
        JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          service: 'websocket-test',
          version: '1.0.0'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Validate WebSocket upgrade
    const upgradeHeader = req.headers.get('upgrade');
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      console.log(`[${requestId}] Invalid upgrade header: ${upgradeHeader}`);
      return new Response(
        JSON.stringify({ 
          error: 'WebSocket upgrade required',
          received: upgradeHeader,
          expected: 'websocket',
          requestId 
        }),
        {
          status: 426,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Upgrade': 'websocket',
            'Connection': 'Upgrade'
          },
        }
      );
    }

    // Upgrade to WebSocket
    console.log(`[${requestId}] Attempting WebSocket upgrade...`);
    const { socket, response } = Deno.upgradeWebSocket(req);
    console.log(`[${requestId}] WebSocket upgrade successful`);

    // Connection state management
    let isActive = true;
    let keepAliveInterval: number | null = null;

    // Parse connection parameters
    const userId = url.searchParams.get('userId') || 'anonymous';
    const callId = url.searchParams.get('callId') || 'browser-session';
    const assistantId = url.searchParams.get('assistantId') || 'default';

    console.log(`[${requestId}] Connection params:`, { userId, callId, assistantId });

    // WebSocket event handlers
    socket.onopen = () => {
      try {
        console.log(`[${requestId}] CLIENT WEBSOCKET OPENED SUCCESSFULLY`);
        isActive = true;
        
        // Send connection confirmation
        const welcomeMessage = {
          type: 'connection_established',
          connectionId: requestId,
          message: 'WebSocket test connection successful',
          userId,
          callId,
          assistantId,
          timestamp: Date.now(),
          capabilities: ['basic-websocket', 'ping-pong', 'echo']
        };
        
        socket.send(JSON.stringify(welcomeMessage));
        console.log(`[${requestId}] Welcome message sent`);
        
        // Start keepalive
        keepAliveInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN && isActive) {
            try {
              socket.send(JSON.stringify({ 
                type: 'ping', 
                connectionId: requestId,
                timestamp: Date.now() 
              }));
              console.log(`[${requestId}] Keepalive ping sent`);
            } catch (error) {
              console.error(`[${requestId}] Keepalive ping failed:`, error);
            }
          }
        }, 20000) as unknown as number;
        
        console.log(`[${requestId}] Keepalive system started`);
        
      } catch (error) {
        console.error(`[${requestId}] Error in onopen handler:`, error);
        try {
          socket.close(1011, 'Internal server error during initialization');
        } catch (closeError) {
          console.error(`[${requestId}] Error closing socket:`, closeError);
        }
      }
    };

    socket.onmessage = (event) => {
      try {
        console.log(`[${requestId}] Message received, parsing...`);
        const data = JSON.parse(event.data);
        console.log(`[${requestId}] Message type: ${data.type || data.event}`);

        switch (data.type || data.event) {
          case 'pong':
            console.log(`[${requestId}] Pong received - connection healthy`);
            break;

          case 'ping':
            console.log(`[${requestId}] Ping received, sending pong`);
            socket.send(JSON.stringify({
              type: 'pong',
              connectionId: requestId,
              timestamp: Date.now()
            }));
            break;

          case 'echo':
            // Echo back the message
            console.log(`[${requestId}] Echo request received`);
            socket.send(JSON.stringify({
              type: 'echo_response',
              originalMessage: data.message || 'Hello from server!',
              connectionId: requestId,
              timestamp: Date.now()
            }));
            break;

          case 'test':
            console.log(`[${requestId}] Test message received`);
            socket.send(JSON.stringify({
              type: 'test_response',
              message: 'Test successful! WebSocket is working.',
              connectionId: requestId,
              timestamp: Date.now()
            }));
            break;

          default:
            console.log(`[${requestId}] Unknown message type: ${data.type || data.event}`);
            // Echo back unknown messages
            socket.send(JSON.stringify({
              type: 'unknown_message_response',
              receivedType: data.type || data.event,
              message: 'Unknown message type received',
              connectionId: requestId,
              timestamp: Date.now()
            }));
            break;
        }
      } catch (error) {
        console.error(`[${requestId}] Error processing message:`, error);
        if (socket.readyState === WebSocket.OPEN) {
          try {
            socket.send(JSON.stringify({
              type: 'error',
              error: 'Message processing failed',
              details: error.message,
              timestamp: Date.now()
            }));
          } catch (sendError) {
            console.error(`[${requestId}] Failed to send error message:`, sendError);
          }
        }
      }
    };

    socket.onclose = (event) => {
      console.log(`[${requestId}] CLIENT WEBSOCKET CLOSED:`, {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      
      isActive = false;
      
      // Cleanup resources
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
        console.log(`[${requestId}] Keepalive stopped`);
      }
      
      console.log(`[${requestId}] Cleanup completed`);
    };

    socket.onerror = (error) => {
      console.error(`[${requestId}] CLIENT WEBSOCKET ERROR:`, error);
      isActive = false;
    };

    console.log(`[${requestId}] WebSocket setup completed`);
    
    return response;

  } catch (error) {
    console.error(`[${requestId}] Fatal error:`, error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        requestId,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

console.log('WebSocket Test Function ready to serve requests'); 