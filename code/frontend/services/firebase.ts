import { adminDb, adminStorage } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export interface Conversation {
    id: string;
    audioUrl: string;
    audioFilename: string;
    duration: number;
    createdAt: Date;
    status: 'processing' | 'completed' | 'failed';
    summary?: ConversationSummary;
    doctorSpeakerId?: string;
    patientSpeakerId?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    speaker: 'doctor' | 'patient';
    text: string;
    timestamp: number;
    createdAt: Date;
}

export interface ConversationSummary {
    chief_complaint?: string;
    symptoms?: string[];
    diagnosis?: string;
    medications?: Array<{
        name?: string;
        dosage?: string | null;
        frequency?: string | null;
        duration?: string | null;
        instructions?: string | null;
    }>;
    follow_up?: string;
    additional_notes?: string;
}

// Upload audio file to Firebase Storage
export async function uploadAudio(blob: Blob, filename: string): Promise<string> {
    const bucket = adminStorage.bucket();
    const file = bucket.file(`recordings/${filename}`);

    const buffer = Buffer.from(await blob.arrayBuffer());

    await file.save(buffer, {
        metadata: {
            contentType: 'audio/webm',
        },
    });

    // Make file publicly accessible (or use signed URLs for security)
    await file.makePublic();

    return file.publicUrl();
}

// Create a new conversation
export async function createConversation(
    audioFilename: string,
    audioUrl: string,
    duration: number
): Promise<string> {
    const conversationRef = adminDb.collection('conversations').doc();

    await conversationRef.set({
        audioUrl,
        audioFilename,
        duration,
        status: 'processing',
        createdAt: Timestamp.now(),
    });

    return conversationRef.id;
}

// Save messages from transcript
export async function saveMessages(
    conversationId: string,
    messages: Array<{ speaker: 'doctor' | 'patient'; text: string; timestamp: number }>
): Promise<void> {
    const batch = adminDb.batch();

    messages.forEach((msg) => {
        const messageRef = adminDb.collection('messages').doc();
        batch.set(messageRef, {
            conversationId,
            speaker: msg.speaker,
            text: msg.text,
            timestamp: msg.timestamp,
            createdAt: Timestamp.now(),
        });
    });

    await batch.commit();
}

// Update conversation status
export async function updateConversationStatus(
    conversationId: string,
    status: 'processing' | 'completed' | 'failed'
): Promise<void> {
    await adminDb.collection('conversations').doc(conversationId).update({
        status,
        updatedAt: Timestamp.now(),
    });
}

export async function updateConversationSummary(
    conversationId: string,
    summary: ConversationSummary | null,
    doctorSpeakerId?: string,
    patientSpeakerId?: string
): Promise<void> {
    await adminDb.collection('conversations').doc(conversationId).update({
        summary: summary ?? null,
        doctorSpeakerId: doctorSpeakerId ?? null,
        patientSpeakerId: patientSpeakerId ?? null,
        updatedAt: Timestamp.now(),
    });
}

// Get conversation with messages
export async function getConversationWithMessages(conversationId: string) {
    const conversationDoc = await adminDb.collection('conversations').doc(conversationId).get();

    if (!conversationDoc.exists) {
        throw new Error('Conversation not found');
    }

    const messagesSnapshot = await adminDb
        .collection('messages')
        .where('conversationId', '==', conversationId)
        .get();

    const messages = messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            conversationId: data.conversationId,
            speaker: data.speaker as 'doctor' | 'patient',
            text: data.text,
            timestamp: data.timestamp,
            createdAt: data.createdAt.toDate(),
        };
    });

    messages.sort((a, b) => {
        const aTime = typeof a.timestamp === 'number' ? a.timestamp : 0;
        const bTime = typeof b.timestamp === 'number' ? b.timestamp : 0;
        return aTime - bTime;
    });

    return {
        conversation: {
            id: conversationDoc.id,
            ...conversationDoc.data(),
            createdAt: conversationDoc.data()?.createdAt.toDate(),
        },
        messages,
    };
}

// Get all conversations
export async function getAllConversations() {
    const snapshot = await adminDb
        .collection('conversations')
        .orderBy('createdAt', 'desc')
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
    }));
}