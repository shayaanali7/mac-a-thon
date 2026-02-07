'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Mic, Search, Calendar, Clock, FileText, ChevronRight, User, Stethoscope } from 'lucide-react';

// Mock data for demonstration
const mockConversations = [
    {
        id: '1',
        date: '2026-02-07',
        time: '10:30 AM',
        duration: '15:30',
        patientInitials: 'JD',
        summary: 'Annual checkup, blood pressure monitoring, lifestyle recommendations',
        hasTranscript: true,
    },
    {
        id: '2',
        date: '2026-02-07',
        time: '09:00 AM',
        duration: '22:15',
        patientInitials: 'SM',
        summary: 'Follow-up for diabetes management, medication adjustment needed',
        hasTranscript: true,
    },
    {
        id: '3',
        date: '2026-02-06',
        time: '3:45 PM',
        duration: '18:00',
        patientInitials: 'RK',
        summary: 'New patient consultation, initial assessment for chronic pain',
        hasTranscript: true,
    },
    {
        id: '4',
        date: '2026-02-06',
        time: '2:00 PM',
        duration: '12:30',
        patientInitials: 'LM',
        summary: 'Routine examination, prescription refill discussion',
        hasTranscript: true,
    },
    {
        id: '5',
        date: '2026-02-05',
        time: '11:15 AM',
        duration: '20:45',
        patientInitials: 'TP',
        summary: 'Cardiology consultation, ECG results review, treatment plan update',
        hasTranscript: true,
    },
];

export default function ConversationsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    const filteredConversations = mockConversations.filter(conv => {
        const matchesSearch = conv.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.patientInitials.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate = !selectedDate || conv.date === selectedDate;
        return matchesSearch && matchesDate;
    });

    const uniqueDates = Array.from(new Set(mockConversations.map(c => c.date))).sort().reverse();

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
                        <div className="flex space-x-4">
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
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by patient initials or summary..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                            >
                                <option value="">All Dates</option>
                                {uniqueDates.map(date => (
                                    <option key={date} value={date}>
                                        {new Date(date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Conversations List */}
                <div className="space-y-4">
                    {filteredConversations.length === 0 ? (
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
                        filteredConversations.map((conversation) => (
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
                                                        Patient: {conversation.patientInitials}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                        <span className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            {new Date(conversation.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            {conversation.time}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <FileText className="w-4 h-4 mr-1" />
                                                            {conversation.duration}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 ml-16">
                                                {conversation.summary}
                                            </p>

                                            {conversation.hasTranscript && (
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
                        ))
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
                                    {filteredConversations.filter(c => c.hasTranscript).length}
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