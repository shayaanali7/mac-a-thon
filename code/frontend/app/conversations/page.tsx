'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Home, Mic, Search, Calendar, Clock, FileText, ChevronRight, User, Stethoscope } from 'lucide-react';

type ConversationListItem = {
    id: string;
    audioFilename?: string;
    audioUrl?: string;
    duration?: number;
    status?: 'processing' | 'completed' | 'failed';
    createdAt?: string;
    summary?: {
        chief_complaint?: string;
    } | null;
};

function formatDuration(seconds?: number) {
    if (!seconds || seconds <= 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDateParts(createdAt?: string) {
    if (!createdAt) return { date: 'Unknown', time: 'Unknown', dateKey: '' };
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return { date: 'Unknown', time: 'Unknown', dateKey: '' };
    const dateKey = date.toISOString().slice(0, 10);
    return {
        date: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        dateKey,
    };
}

export default function ConversationsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [conversations, setConversations] = useState<ConversationListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        async function loadConversations() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch('/api/conversations');
                if (!response.ok) {
                    throw new Error('Failed to load conversations');
                }
                const data = await response.json();
                if (isActive) {
                    setConversations(Array.isArray(data.conversations) ? data.conversations : []);
                }
            } catch (err) {
                if (isActive) {
                    setError(err instanceof Error ? err.message : 'Failed to load conversations');
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        loadConversations();

        return () => {
            isActive = false;
        };
    }, []);

    const filteredConversations = useMemo(() => {
        return conversations.filter((conv) => {
            const matchesSearch = `${conv.summary?.chief_complaint ?? ''} ${conv.audioFilename ?? ''}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const { dateKey } = formatDateParts(conv.createdAt);
            const matchesDate = !selectedDate || dateKey === selectedDate;
            return matchesSearch && matchesDate;
        });
    }, [conversations, searchQuery, selectedDate]);

    const uniqueDates = useMemo(() => {
        const dates = conversations
            .map((conv) => formatDateParts(conv.createdAt).dateKey)
            .filter(Boolean);
        return Array.from(new Set(dates)).sort().reverse();
    }, [conversations]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Mic className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">MediScribe</span>
                        </div>
                        <div className="flex space-x-10">
                            <Link
                                href="/record"
                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                <Mic className="w-5 h-5 mr-2" />
                                New Recording
                            </Link>
                            <Link
                                href="/"
                                className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                <Home className="w-5 h-5 mr-1" />
                                Home
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Conversation History
                    </h1>
                    <p className="text-lg text-gray-600">
                        View and review past doctor-patient conversations
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="grid gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by patient initials or summary..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Conversations List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <FileText className="w-16 h-16 text-black mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Loading conversations...
                            </h3>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Unable to load conversations
                            </h3>
                            <p className="text-gray-600">{error}</p>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No conversations found
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery || selectedDate
                                    ? 'Try adjusting your search filters'
                                    : 'Start recording your first conversation'}
                            </p>
                            <Link
                                href="/record"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                <Mic className="w-5 h-5 mr-2" />
                                Start Recording
                            </Link>
                        </div>
                    ) : (
                        filteredConversations.map((conversation) => {
                            const { date, time } = formatDateParts(conversation.createdAt);
                            const durationLabel = formatDuration(conversation.duration);
                            const title = conversation.summary?.chief_complaint
                                ? conversation.summary.chief_complaint
                                : `Conversation on ${date}`;
                            const summary = conversation.audioFilename
                                ? `Audio file: ${conversation.audioFilename}`
                                : 'Audio file unavailable';
                            return (
                                <Link
                                    key={conversation.id}
                                    href={`/conversations/${conversation.id}`}
                                    className="block"
                                >
                                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer border-l-4 border-blue-600">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4 mb-3">
                                                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                                                        <User className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {title}
                                                        </h3>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                            <span className="flex items-center">
                                                                <Calendar className="w-4 h-4 mr-1" />
                                                                {date}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-1" />
                                                                {time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {conversation.status === 'completed' && (
                                                    <div className="flex items-center mt-3 ml-16">
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                                                <Stethoscope className="w-4 h-4 inline mr-1" />
                                                                Transcribed
                                                            </span>
                                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                                                <FileText className="w-4 h-4 inline mr-1" />
                                                                Summary Available
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0 mt-3" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>

                {/* Stats Summary */}
                {filteredConversations.length > 0 && (
                    <div className="mt-8 bg-blue-50 rounded-xl p-6">
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-3xl font-bold text-blue-600 mb-1">
                                    {filteredConversations.length}
                                </div>
                                <div className="text-gray-600">Total Conversations</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-blue-600 mb-1">
                                    {filteredConversations.filter(c => c.status === 'completed').length}
                                </div>
                                <div className="text-gray-600">Transcribed</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-blue-600 mb-1">
                                    {uniqueDates.length}
                                </div>
                                <div className="text-gray-600">Days with Activity</div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}