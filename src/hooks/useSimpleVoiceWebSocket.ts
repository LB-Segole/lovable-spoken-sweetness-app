
import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceWebSocketConfig {
  userId: string;
  callId?: string;
  assistantId?: string;
  onConnectionChange?: (connected: boolean) => void;
  onMessage?: (message: any) => void;
  onError?: (error: string) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onAIResponse?: (text: string) => void;
  onAudioResponse?: (audioData: string) => void;
}

export const useSimpleVoiceWebSocket = (config: VoiceWebSocketConfig) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnect = useRef(false);

  console.log('🎙️ useSimpleVoiceWebSocket initialized');

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) {
      console.log('⚠️ Already connecting or connected');
      return;
    }

    console.log('🔄 Connecting to voice WebSocket...');
    setIsConnecting(true);
    setError(null);
    isManualDisconnect.current = false;

    try {
      // Construct WebSocket URL with proper parameters
      const wsUrl = `wss://csixccpoxpnwowbgkoyw.supabase.co/functions/v1/deepgram-voice-agent`;
      const url = new URL(wsUrl);
      url.searchParams.set('userId', config.userId);
      url.searchParams.set('callId', config.callId || 'browser-test');
      url.searchParams.set('assistantId', config.assistantId || 'demo');

      console.log('🔗 WebSocket URL:', url.toString());
      console.log('🔗 URL Parameters:', {
        userId: config.userId,
        callId: config.callId || 'browser-test',
        assistantId: config.assistantId || 'demo'
      });

      wsRef.current = new WebSocket(url.toString());
      
      console.log('🔌 WebSocket created, current state:', wsRef.current.readyState);
      console.log('🔌 WebSocket ready states: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3');

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        config.onConnectionChange?.(true);

        // Send initial connection message
        const connectMessage = {
          type: 'connected',
          userId: config.userId,
          callId: config.callId || 'browser-test',
          assistantId: config.assistantId || 'demo',
          timestamp: Date.now()
        };
        
        console.log('📤 Sending connection message:', connectMessage);
        wsRef.current?.send(JSON.stringify(connectMessage));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data.type || data.event);
          
          config.onMessage?.(data);

          // Handle specific message types
          switch (data.type || data.event) {
            case 'transcript':
              if (data.text) {
                config.onTranscript?.(data.text, data.isFinal || false);
              }
              break;
            case 'ai_response':
              if (data.text) {
                config.onAIResponse?.(data.text);
              }
              break;
            case 'audio_response':
              if (data.audio) {
                config.onAudioResponse?.(data.audio);
              }
              break;
            case 'error':
              console.error('❌ Backend error:', data.error);
              setError(data.error || 'Backend error');
              config.onError?.(data.error || 'Backend error');
              break;
            case 'pong':
              console.log('💓 Received pong');
              break;
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        console.error('🔌 WebSocket state during error:', {
          _type: typeof wsRef.current?.readyState,
          value: wsRef.current?.readyState
        });
        
        const errorMessage = 'WebSocket connection error - Check Edge Function logs for details';
        setError(errorMessage);
        config.onError?.(errorMessage);
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, '-', event.reason);
        console.log('🔌 Close event details:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          type: event.type
        });
        
        setIsConnected(false);
        setIsConnecting(false);
        config.onConnectionChange?.(false);
        
        console.log('🔌 Voice WebSocket disconnected');

        if (!isManualDisconnect.current && event.code !== 1000) {
          // Auto-reconnect after a delay for unexpected disconnections
          console.log('🔄 Scheduling reconnection...');
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      setIsConnecting(false);
      setError(`Failed to create WebSocket: ${error}`);
      config.onError?.(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [config, isConnecting, isConnected]);

  const disconnect = useCallback(() => {
    console.log('🔄 Disconnecting...');
    isManualDisconnect.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      console.log('🔄 Disconnecting WebSocket...');
      if (wsRef.current.readyState === WebSocket.OPEN) {
        console.log('🔌 Closing WebSocket connection');
        wsRef.current.close(1000, 'Manual disconnect');
      }
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    config.onConnectionChange?.(false);
  }, [config]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(message);
      console.log('📤 Sending message:', message.type || 'unknown');
      wsRef.current.send(messageStr);
      return true;
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
      return false;
    }
  }, []);

  const sendText = useCallback((text: string) => {
    return sendMessage({
      type: 'text_input',
      text,
      timestamp: Date.now()
    });
  }, [sendMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendMessage,
    sendText
  };
};
