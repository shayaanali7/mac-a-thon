'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Home,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Download,
  User,
  Stethoscope,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
type ConversationDetail = {
  id: string;
  audioFilename?: string;
  audioUrl?: string;
  duration?: number;
  status?: 'processing' | 'completed' | 'failed';
  createdAt?: string;
};

type TranscriptEntry = {
  speaker: 'doctor' | 'patient';
  text: string;
  timestamp: number;
};

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatTime(seconds?: number) {
  if (seconds == null || Number.isNaN(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params?.id as string;
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'ai'>('transcript');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<TranscriptEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    let isActive = true;

    async function loadConversation() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/conversations/${conversationId}`);
        if (!response.ok) {
          throw new Error('Conversation not found');
        }
        const data = await response.json();
        if (isActive) {
          setConversation(data.conversation ?? null);
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Unable to load conversation');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadConversation();

    return () => {
      isActive = false;
    };
  }, [conversationId]);

  const headerDate = useMemo(() => {
    if (!conversation?.createdAt) return 'Unknown date';
    const date = new Date(conversation.createdAt);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [conversation?.createdAt]);

  const headerTime = useMemo(() => {
    if (!conversation?.createdAt) return 'Unknown time';
    const date = new Date(conversation.createdAt);
    if (Number.isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }, [conversation?.createdAt]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Conversation</h2>
          <p className="text-gray-600">Fetching transcription data...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Conversation Not Found</h2>
          {error && <p className="text-gray-600 mb-4">{error}</p>}
          <Link href="/conversations" className="text-blue-600 hover:text-blue-700">
            Back to Conversations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">MediScribe</span>
            </div>
            <div className="flex space-x-10">
              <Link
                href="/conversations"
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                All Conversations
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
        {/* Conversation Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Conversation {conversation.id.slice(0, 6)}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {headerDate}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {headerTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('transcript')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${activeTab === 'transcript'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Full Transcript
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${activeTab === 'summary'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <ClipboardList className="w-5 h-5 inline mr-2" />
                Medical Summary
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${activeTab === 'ai'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <AlertCircle className="w-5 h-5 inline mr-2" />
                Talk to AI
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'transcript' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Conversation Transcript</h2>
                  <p className="text-gray-600">Full verbatim transcript with speaker identification</p>
                </div>

                {messages.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${entry.speaker === 'doctor'
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'bg-gray-50 border-l-4 border-gray-400'
                      }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-full ${entry.speaker === 'doctor' ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                        {entry.speaker === 'doctor' ? (
                          <Stethoscope className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 capitalize">
                        {entry.speaker}
                      </span>
                      <span className="text-sm text-gray-500">{formatTime(entry.timestamp)}</span>
                    </div>
                    <p className="text-gray-700 ml-11">{entry.text}</p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <p className="text-gray-600">No transcript messages available yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Medical Summary</h2>
                  <p className="text-gray-600">Clinical overview for healthcare professionals</p>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-600">
                    No structured summary is available yet. This section can be filled once summary
                    generation is enabled.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Talk to AI</h2>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 h-80 overflow-y-auto space-y-4">
                  {chatMessages.length === 0 && (
                    <p className="text-black">Ask questions about this conversation.</p>
                  )}
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${msg.role === 'user'
                        ? 'bg-blue-50 border border-blue-200 ml-auto'
                        : 'bg-gray-50 border border-gray-200'
                        }`}
                    >
                      <p className="text-sm text-black">{msg.text}</p>
                    </div>
                  ))}
                </div>
                <form
                  className="flex gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const next = chatInput.trim();
                    if (!next) return;
                    setChatMessages((prev) => [...prev, { role: 'user', text: next }]);
                    setChatInput('');
                  }}
                >
                  <input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Ask about clarification, meds, or next steps..."
                    className="flex-1 px-4 py-3 border text-gray-700 placeholder:text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}