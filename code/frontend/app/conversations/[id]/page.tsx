'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Loader2 } from 'lucide-react';
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
  summary?: {
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
  } | null;
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
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'ai' | 'images'>('transcript');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<TranscriptEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const regenerateSummary = async () => {
    if (uploadedImages.length === 0) {
      alert('Please upload at least one image first');
      return;
    }

    setIsRegenerating(true);

    try {
      const formData = new FormData();
      formData.append('conversationId', conversationId);

      uploadedImages.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await fetch('/api/regenerate-summary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to regenerate');

      const { summary } = await response.json();

      setConversation(prev => prev ? { ...prev, summary } : null);
      setUploadedImages([]);
      setActiveTab('summary'); // Switch to summary tab to see result
      alert('✅ Summary updated!');

    } catch (error) {
      console.error(error);
      alert('❌ Failed to regenerate summary');
    } finally {
      setIsRegenerating(false);
    }
  };

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
              <button
                onClick={() => setActiveTab('images')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${activeTab === 'images'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Camera className="w-5 h-5 inline mr-2" />
                Add Images
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
                {!conversation.summary && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <p className="text-gray-600">
                      No structured summary is available yet. This section can be filled once summary
                      generation is enabled.
                    </p>
                  </div>
                )}
                {conversation.summary && (
                  <div className="space-y-5">
                    <div className="bg-blue-50 rounded-lg p-5 border-l-4 border-blue-600">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                        Chief Complaint
                      </h3>
                      <p className="text-gray-700">
                        {conversation.summary.chief_complaint || 'Not provided'}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Symptoms</h3>
                      {conversation.summary.symptoms && conversation.summary.symptoms.length > 0 ? (
                        <ul className="space-y-2">
                          {conversation.summary.symptoms.map((symptom, index) => (
                            <li key={index} className="flex items-start">
                              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </span>
                              <span className="text-gray-700">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No symptoms listed.</p>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Assessment / Diagnosis</h3>
                      <p className="text-gray-700">
                        {conversation.summary.diagnosis || 'Not provided'}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Medications</h3>
                      {conversation.summary.medications && conversation.summary.medications.length > 0 ? (
                        <ul className="space-y-3">
                          {conversation.summary.medications.map((med, index) => (
                            <li key={index} className="text-gray-700">
                              <span className="font-semibold">{med.name || 'Medication'}</span>
                              {med.dosage ? ` — ${med.dosage}` : ''}
                              {med.frequency ? `, ${med.frequency}` : ''}
                              {med.duration ? `, ${med.duration}` : ''}
                              {med.instructions ? ` (${med.instructions})` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No medications listed.</p>
                      )}
                    </div>

                    <div className="bg-green-50 rounded-lg p-5 border-l-4 border-green-600">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <ClipboardList className="w-5 h-5 mr-2 text-green-600" />
                        Follow Up
                      </h3>
                      <p className="text-gray-700">
                        {conversation.summary.follow_up || 'Not provided'}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Additional Notes</h3>
                      <p className="text-gray-700">
                        {conversation.summary.additional_notes || 'Not provided'}
                      </p>
                    </div>
                  </div>
                )}
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
            {activeTab === 'images' && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Add Medical Images</h2>
                  <p className="text-gray-600">Upload prescriptions, notes, or lab results to enhance the summary</p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRegenerating}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium"
                  >
                    <Camera className="w-4 h-4 inline mr-2" />
                    Upload Images
                  </button>

                  {uploadedImages.length > 0 && (
                    <button
                      onClick={regenerateSummary}
                      disabled={isRegenerating}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                      {isRegenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 inline mr-2" />
                          Regenerate Summary ({uploadedImages.length})
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Image Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}