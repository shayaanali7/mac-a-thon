import { NextRequest, NextResponse } from 'next/server';
import { saveMessages, updateConversationStatus, updateConversationSummary } from '@/services/firebase';

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

        const { dialogue, analysis } = await backendResponse.json();
        console.log(dialogue);
        console.log('🧠 Analyzer:', analysis);
        console.log('✅ Received', dialogue.length, 'dialogue entries from backend');

        // Parse speakers
        const messages = parseDialogueToMessages(dialogue, analysis);
        console.log('✅ Parsed', messages.length, 'messages');

        if (messages.length === 0) {
            throw new Error('No messages extracted');
        }

        // Save to Firestore
        console.log('⏳ Saving to Firestore...');
        await saveMessages(conversationId, messages);
        await updateConversationSummary(
            conversationId,
            analysis ? {
                chief_complaint: analysis.chief_complaint,
                symptoms: analysis.symptoms,
                diagnosis: analysis.diagnosis,
                medications: analysis.medications,
                follow_up: analysis.follow_up,
                additional_notes: analysis.additional_notes,
            } : null,
            analysis?.doctor_speaker,
            analysis?.patient_speaker
        );
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

function parseDialogueToMessages(
    dialogue: Array<{ speakerId: string; text: string; start: number; end: number }>,
    analysis?: { doctor_speaker?: string; patient_speaker?: string }
): Array<{ speaker: 'doctor' | 'patient'; text: string; timestamp: number }> {
    if (!dialogue || dialogue.length === 0) {
        return [];
    }

    const uniqueSpeakers = Array.from(new Set(dialogue.map(d => d.speakerId)));
    console.log('🏷️ Speakers found:', uniqueSpeakers);

    const speakerMap: Record<string, 'doctor' | 'patient'> = {};

    if (analysis?.doctor_speaker && analysis?.patient_speaker) {
        speakerMap[analysis.doctor_speaker] = 'doctor';
        speakerMap[analysis.patient_speaker] = 'patient';
    } else {
        speakerMap[uniqueSpeakers[0]] = 'doctor';
        speakerMap[uniqueSpeakers[1] || uniqueSpeakers[0]] = 'patient';
    }

    console.log('👨‍⚕️ Mapping:', speakerMap);

    return dialogue.map((entry) => ({
        speaker: speakerMap[entry.speakerId] || 'doctor',
        text: entry.text,
        timestamp: entry.start,
    }));
}