import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { message, threadId } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Missing message' }, { status: 400 });
        }

        const response = await fetch('http://localhost:4000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, threadId }),
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(
                { error: 'Chat failed', details: error.details || error.error || 'Unknown' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Chat failed', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
