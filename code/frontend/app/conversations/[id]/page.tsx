'use client';

import { useState } from 'react';
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

// Mock data for a conversation
const mockConversationData: { [key: string]: any } = {
  '1': {
    id: '1',
    date: '2026-02-07',
    time: '10:30 AM',
    duration: '15:30',
    patientInitials: 'JD',
    transcript: [
      { speaker: 'doctor', text: 'Good morning! How have you been feeling since your last visit?', timestamp: '00:00' },
      { speaker: 'patient', text: 'Good morning, doctor. I\'ve been feeling much better overall. The medication you prescribed has really helped.', timestamp: '00:05' },
      { speaker: 'doctor', text: 'That\'s great to hear! Let\'s check your blood pressure today and see how it compares to last time.', timestamp: '00:12' },
      { speaker: 'patient', text: 'Sure, I\'ve been monitoring it at home too. It seems to be staying around 130 over 85.', timestamp: '00:20' },
      { speaker: 'doctor', text: 'Excellent. That\'s a significant improvement from the 145 over 95 we saw last month. The lifestyle changes and medication are working well together.', timestamp: '00:28' },
      { speaker: 'patient', text: 'I\'ve been trying to walk for 30 minutes every day like you suggested. It\'s become part of my routine now.', timestamp: '00:40' },
      { speaker: 'doctor', text: 'That\'s wonderful! Regular exercise is one of the best things you can do for your cardiovascular health. How about your diet? Have you been able to reduce sodium intake?', timestamp: '00:48' },
      { speaker: 'patient', text: 'Yes, I\'ve been reading labels more carefully and cooking at home more often. My wife has been really supportive.', timestamp: '01:00' },
      { speaker: 'doctor', text: 'Perfect. I\'d like to continue with the current medication dosage. We\'ll schedule another follow-up in three months to monitor your progress.', timestamp: '01:10' },
      { speaker: 'patient', text: 'Sounds good. Should I continue the same exercise routine?', timestamp: '01:22' },
      { speaker: 'doctor', text: 'Absolutely. If you\'re feeling good, you might even gradually increase to 45 minutes a day, but listen to your body and don\'t overdo it.', timestamp: '01:28' },
      { speaker: 'patient', text: 'I will. Thank you, doctor.', timestamp: '01:40' },
      { speaker: 'doctor', text: 'You\'re welcome. Keep up the great work! See you in three months.', timestamp: '01:43' },
    ],
    medicalSummary: {
      chiefComplaint: 'Annual checkup and blood pressure monitoring follow-up',
      vitalSigns: {
        bloodPressure: '130/85 mmHg',
        previousBP: '145/95 mmHg (1 month ago)',
      },
      assessment: [
        'Hypertension - Well controlled with current medication regimen',
        'Patient compliance excellent with both medication and lifestyle modifications',
        'Significant improvement in blood pressure readings',
        'Patient reports regular daily walking (30 minutes)',
        'Dietary modifications implemented successfully (reduced sodium intake)',
      ],
      currentMedications: [
        'Antihypertensive medication (dosage maintained)',
      ],
      plan: [
        'Continue current medication at same dosage',
        'Maintain daily 30-minute walks, consider gradual increase to 45 minutes',
        'Continue low-sodium diet',
        'Home blood pressure monitoring',
        'Follow-up appointment in 3 months',
      ],
      clinicalNotes: [
        'Patient showing excellent adherence to treatment plan',
        'Strong family support system noted',
        'Positive lifestyle changes sustained',
        'No adverse effects from medication reported',
      ],
    },
  },
};

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params?.id as string;
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('transcript');

  const conversation = mockConversationData[conversationId];

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Conversation Not Found</h2>
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
            <div className="flex space-x-4">
              <Link
                href="/conversations"
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                All Conversations
              </Link>
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-700 font-medium transition-colors"
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
                  Patient: {conversation.patientInitials}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(conversation.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
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

            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
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

                {conversation.transcript.map((entry: any, index: number) => (
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
                      <span className="text-sm text-gray-500">{entry.timestamp}</span>
                    </div>
                    <p className="text-gray-700 ml-11">{entry.text}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Medical Summary</h2>
                  <p className="text-gray-600">Clinical overview for healthcare professionals</p>
                </div>

                {/* Chief Complaint */}
                <div className="bg-blue-50 rounded-lg p-5 border-l-4 border-blue-600">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                    Chief Complaint
                  </h3>
                  <p className="text-gray-700">{conversation.medicalSummary.chiefComplaint}</p>
                </div>

                {/* Vital Signs */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Vital Signs</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Current Blood Pressure:</span>
                      <p className="font-medium text-gray-900">{conversation.medicalSummary.vitalSigns.bloodPressure}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Previous Reading:</span>
                      <p className="font-medium text-gray-900">{conversation.medicalSummary.vitalSigns.previousBP}</p>
                    </div>
                  </div>
                </div>

                {/* Assessment */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Assessment</h3>
                  <ul className="space-y-2">
                    {conversation.medicalSummary.assessment.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Current Medications */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Current Medications</h3>
                  <ul className="space-y-2">
                    {conversation.medicalSummary.currentMedications.map((med: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        <span className="text-gray-700">{med}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Treatment Plan */}
                <div className="bg-green-50 rounded-lg p-5 border-l-4 border-green-600">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <ClipboardList className="w-5 h-5 mr-2 text-green-600" />
                    Treatment Plan
                  </h3>
                  <ul className="space-y-2">
                    {conversation.medicalSummary.plan.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Clinical Notes */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Clinical Notes</h3>
                  <ul className="space-y-2">
                    {conversation.medicalSummary.clinicalNotes.map((note: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2"></div>
                        <span className="text-gray-700">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}