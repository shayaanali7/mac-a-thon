import { NextResponse } from 'next/server';
import { getAllConversations } from '@/services/firebase';

export async function GET() {
    try {
        const conversations = await getAllConversations();

        const normalized = conversations.map((conversation: any) => ({
            ...conversation,
            createdAt: conversation.createdAt?.toISOString?.() ?? null,
        }));

        return NextResponse.json({ conversations: normalized });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch conversations', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
