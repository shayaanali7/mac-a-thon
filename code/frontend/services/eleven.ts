// ElevenLabs API service for audio transcription

interface TranscriptUtterance {
    speaker: string;
    text: string;
    start: number;
    end: number;
}

interface TranscriptResponse {
    text: string;
    utterances?: TranscriptUtterance[];
    language?: string;
    duration?: number;
}

/**
 * Convert Buffer to Blob (Node.js Buffer → Browser Blob)
 */
function bufferToBlob(buffer: Buffer): Blob {
    return new Blob([new Uint8Array(buffer)], { type: 'audio/webm' });
}

/**
 * Transcribe audio using ElevenLabs API
 * @param audioBuffer - Audio file as Buffer or Blob
 * @returns Transcript with speaker diarization
 */
export async function transcribeAudio(
    audioBuffer: Buffer | Blob
): Promise<TranscriptResponse> {
    try {
        const formData = new FormData();

        // Convert Buffer to Blob if needed
        const audioBlob = Buffer.isBuffer(audioBuffer)
            ? bufferToBlob(audioBuffer)
            : audioBuffer;

        formData.append('audio', audioBlob, 'recording.webm');

        // Enable speaker diarization for doctor/patient identification
        formData.append('diarize', 'true');

        const response = await fetch('https://api.elevenlabs.io/v1/audio-to-text', {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return {
            text: data.text,
            utterances: data.utterances || [],
            language: data.language,
            duration: data.duration,
        };
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw new Error('Failed to transcribe audio with ElevenLabs');
    }
}

/**
 * Parse ElevenLabs transcript into doctor/patient messages
 * Assumes Speaker 1 = Doctor, Speaker 2 = Patient
 */
export function parseTranscriptToMessages(
    transcript: TranscriptResponse
): Array<{
    speaker: 'doctor' | 'patient';
    text: string;
    timestamp: number;
}> {
    if (!transcript.utterances || transcript.utterances.length === 0) {
        // Fallback if no speaker diarization
        return [
            {
                speaker: 'doctor',
                text: transcript.text,
                timestamp: 0,
            },
        ];
    }

    // Map speakers to roles
    return transcript.utterances.map((utterance) => ({
        speaker: utterance.speaker === 'Speaker 1' ? 'doctor' : 'patient',
        text: utterance.text,
        timestamp: utterance.start,
    }));
}