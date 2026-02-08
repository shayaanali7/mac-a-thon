import { NextRequest, NextResponse } from 'next/server';
import { uploadAudio, createConversation } from '@/services/firebase';

export async function POST(request: NextRequest) {
    console.log('🎯 Upload API called');

    try {
        const formData = await request.formData();
        console.log('📋 FormData received');

        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            console.error('❌ No audio file in FormData');
            return NextResponse.json({ error: 'No audio file' }, { status: 400 });
        }

        console.log('🎵 Audio file details:');
        console.log('   Name:', audioFile.name);
        console.log('   Size:', audioFile.size, 'bytes');
        console.log('   Type:', audioFile.type);

        const filename = `recording-${Date.now()}.webm`;
        console.log('📝 Generated filename:', filename);

        const blob = new Blob([await audioFile.arrayBuffer()], { type: 'audio/webm' });
        console.log('📦 Created blob, size:', blob.size, 'bytes');

        console.log('⏳ Calling uploadAudio...');
        const audioUrl = await uploadAudio(blob, filename);
        console.log('✅ Upload complete, URL:', audioUrl);

        console.log('⏳ Creating conversation record...');
        const conversationId = await createConversation(filename, audioUrl, 0);
        console.log('✅ Conversation created:', conversationId);

        return NextResponse.json({
            filename,
            audioUrl,
            conversationId
        });
    } catch (error) {
        console.error('❌ Upload error:', error);
        return NextResponse.json({
            error: 'Upload failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}