import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
    try {
        console.log('🔄 Frontend: Regenerate summary called');

        const formData = await request.formData();
        const conversationId = formData.get('conversationId') as string;

        if (!conversationId) {
            return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        // Step 1: Get original conversation and messages from Firestore
        console.log('📥 Fetching conversation from Firestore...');
        const conversationDoc = await adminDb.collection('conversations').doc(conversationId).get();

        if (!conversationDoc.exists) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const messagesSnapshot = await adminDb
            .collection('messages')
            .where('conversationId', '==', conversationId)
            .orderBy('timestamp', 'asc')
            .get();

        // Convert messages to dialogue format
        const dialogue = messagesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                speakerId: data.speaker === 'doctor' ? '0' : '1',
                text: data.text,
                start: data.timestamp,
                end: data.timestamp + 5, // Approximate
            };
        });

        console.log('✅ Retrieved', dialogue.length, 'messages');

        // Step 2: Forward images to backend for Gemini analysis
        const backendFormData = new FormData();

        // Add all images from frontend
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('image_')) {
                backendFormData.append(key, value);
            }
        }
        backendFormData.append('conversationId', conversationId);

        console.log('📡 Sending to backend for Gemini analysis...');
        const backendResponse = await fetch('http://localhost:4000/api/regenerate-summary', {
            method: 'POST',
            body: backendFormData,
        });

        if (!backendResponse.ok) {
            throw new Error('Backend analysis failed');
        }

        const { imageAnalysis } = await backendResponse.json();
        console.log('✅ Received image analysis');

        // Step 3: Generate new summary with Gemini
        console.log('📝 Generating new summary...');
        const summaryResponse = await fetch('http://localhost:4000/api/generate-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dialogue,
                imageAnalysis,
            }),
        });

        if (!summaryResponse.ok) {
            throw new Error('Summary generation failed');
        }

        const { summary } = await summaryResponse.json();
        console.log('✅ New summary generated');

        // Step 4: Update Firestore with new summary
        await adminDb.collection('conversations').doc(conversationId).update({
            summary,
            updatedAt: new Date(),
        });

        console.log('✅ Summary updated in Firestore');

        return NextResponse.json({
            success: true,
            summary,
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return NextResponse.json({
            error: 'Failed to regenerate summary',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}