import { NextRequest, NextResponse } from 'next/server';
import { saveMessages, updateConversationStatus } from '@/services/firebase';

export async function POST(request: NextRequest) {
    let conversationId: string | undefined;

    try {
        console.log('🎯 Frontend transcribe API called');

        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;
        conversationId = formData.get('conversationId') as string;

        console.log('📋 Received:');
        console.log('   Audio file:', audioFile?.name, '-', audioFile?.size, 'bytes');
        console.log('   Conversation ID:', conversationId);

        if (!audioFile || !conversationId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Forward to backend Express server
        const backendFormData = new FormData();
        backendFormData.append('audio', audioFile);
        backendFormData.append('conversationId', conversationId);

        console.log('📡 Forwarding to backend server...');
        const backendResponse = await fetch('http://localhost:4000/api/transcribe', {
            method: 'POST',
            body: backendFormData,
        });

        if (!backendResponse.ok) {
            const error = await backendResponse.json();
            throw new Error(error.details || 'Backend transcription failed');
        }

        const { dialogue } = await backendResponse.json();
        console.log('✅ Received', dialogue.length, 'dialogue entries from backend');

        // Parse speakers
        const messages = parseDialogueToMessages(dialogue);
        console.log('✅ Parsed', messages.length, 'messages');

        if (messages.length === 0) {
            throw new Error('No messages extracted');
        }

        // Save to Firestore
        console.log('⏳ Saving to Firestore...');
        await saveMessages(conversationId, messages);
        await updateConversationStatus(conversationId, 'completed');
        console.log('✅ Saved to Firestore');

        return NextResponse.json({
            success: true,
            conversationId,
            messageCount: messages.length,
        });

    } catch (error) {
        console.error('❌ Error:', error);

        if (conversationId) {
            await updateConversationStatus(conversationId, 'failed');
        }

        return NextResponse.json({
            error: 'Transcription failed',
            details: error instanceof Error ? error.message : 'Unknown'
        }, { status: 500 });
    }
}

// Helper function to parse dialogue
function parseDialogueToMessages(
    dialogue: Array<{ speakerId: string; text: string; start: number; end: number }>
): Array<{ speaker: 'doctor' | 'patient'; text: string; timestamp: number }> {
    if (!dialogue || dialogue.length === 0) {
        return [];
    }

    const uniqueSpeakers = Array.from(new Set(dialogue.map(d => d.speakerId)));
    console.log('🏷️ Speakers found:', uniqueSpeakers);

    const speakerMap: Record<string, 'doctor' | 'patient'> = {
        [uniqueSpeakers[0]]: 'doctor',
        [uniqueSpeakers[1] || uniqueSpeakers[0]]: 'patient',
    };

    console.log('👨‍⚕️ Mapping:', speakerMap);

    return dialogue.map((entry) => ({
        speaker: speakerMap[entry.speakerId] || 'doctor',
        text: entry.text,
        timestamp: entry.start,
    }));
}