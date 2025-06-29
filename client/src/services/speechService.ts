
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

const deepgram = createClient(import.meta.env.VITE_DEEPGRAM_API_KEY || '');

export interface TranscriptResult {
  transcript: string;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export const transcribeAudio = async (audioBuffer: Buffer): Promise<TranscriptResult> => {
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        diarize: true,
        utterances: true,
        keywords: ['First Choice Solutions', 'business', 'services', 'help'],
        detect_language: false,
        filler_words: false,
        multichannel: false
      }
    );

    if (error) {
      throw new Error(`Deepgram transcription error: ${error.message}`);
    }

    const channel = result.results.channels[0];
    const alternative = channel.alternatives[0];

    return {
      transcript: alternative.transcript,
      confidence: alternative.confidence,
      words: alternative.words || []
    };

  } catch (error) {
    console.error('Deepgram transcription failed:', error);
    throw new Error('Speech transcription failed');
  }
};

export const transcribeAudioFromUrl = async (audioUrl: string): Promise<TranscriptResult> => {
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url: audioUrl },
      {
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        diarize: true,
        utterances: true
      }
    );

    if (error) {
      throw new Error(`Deepgram transcription error: ${error.message}`);
    }

    const channel = result.results.channels[0];
    const alternative = channel.alternatives[0];

    return {
      transcript: alternative.transcript,
      confidence: alternative.confidence,
      words: alternative.words || []
    };

  } catch (error) {
    console.error('Deepgram URL transcription failed:', error);
    throw new Error('Speech transcription from URL failed');
  }
};

// Real-time transcription for live calls using DeepGram only
export class LiveTranscription {
  private connection: any;
  private isConnected: boolean = false;

  constructor(private onTranscript: (transcript: string, confidence: number) => void) {}

  async connect() {
    try {
      this.connection = deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        utterance_end_ms: 1000,
        vad_events: true
      });

      this.connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('Deepgram live transcription connected');
        this.isConnected = true;
      });

      this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel.alternatives[0].transcript;
        const confidence = data.channel.alternatives[0].confidence;
        
        if (transcript && data.is_final) {
          this.onTranscript(transcript, confidence);
        }
      });

      this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('Deepgram live transcription error:', error);
        this.isConnected = false;
      });

      this.connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram live transcription closed');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Failed to connect to Deepgram live transcription:', error);
      throw error;
    }
  }

  sendAudio(audioData: Buffer) {
    if (this.isConnected && this.connection) {
      this.connection.send(audioData);
    }
  }

  disconnect() {
    if (this.connection) {
      this.connection.finish();
      this.isConnected = false;
    }
  }
}

// Text-to-Speech using DeepGram
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  try {
    const response = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${import.meta.env.VITE_DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`DeepGram TTS error: ${response.status}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('DeepGram TTS failed:', error);
    throw new Error('Speech generation failed');
  }
};
