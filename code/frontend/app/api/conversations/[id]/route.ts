import { NextRequest, NextResponse } from 'next/server';
import { getConversationWithMessages } from '@/services/firebase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await getConversationWithMessages(id);

        const conversation = {
            ...data.conversation,
            createdAt: data.conversation.createdAt?.toISOString?.() ?? null,
        };

        const messages = data.messages.map((message: any) => ({
            ...message,
            createdAt: message.createdAt?.toISOString?.() ?? null,
        }));

        return NextResponse.json({ conversation, messages });
    } catch (error) {
        return NextResponse.json(
            { error: 'Conversation not found', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 404 }
        );
    }
}
