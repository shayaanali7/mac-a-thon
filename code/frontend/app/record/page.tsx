'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mic, Square, Play, Pause, Home, Save, Trash2 } from 'lucide-react';

export default function RecordPage() {
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Unable to access microphone. Please check permissions.');
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
            } else {
                mediaRecorderRef.current.pause();
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            }
            setIsPaused(!isPaused);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const discardRecording = () => {
        setAudioBlob(null);
        setRecordingTime(0);
        chunksRef.current = [];
    };

    const saveRecording = async () => {
        if (!audioBlob) return;

        setIsProcessing(true);

        // Simulate processing (replace with actual API call)
        setTimeout(() => {
            // In a real app, you would:
            // 1. Upload the audio to your server
            // 2. Process it with transcription service
            // 3. Generate the summary
            // 4. Save to database

            setIsProcessing(false);
            router.push('/conversations');
        }, 2000);
    };

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
                        <Link
                            href="/"
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <Home className="w-5 h-5 mr-1" />
                            Home
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Record Conversation
                    </h1>
                    <p className="text-lg text-gray-600">
                        Record doctor-patient conversations for transcription and analysis
                    </p>
                </div>

                {/* Recording Interface */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    {/* Timer Display */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-48 h-48 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-6 relative">
                            {isRecording && !isPaused && (
                                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75"></div>
                            )}
                            <div className="relative">
                                <div className="text-5xl font-bold text-white">
                                    {formatTime(recordingTime)}
                                </div>
                                {isRecording && (
                                    <div className="text-white text-sm mt-2">
                                        {isPaused ? 'Paused' : 'Recording...'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {isRecording && (
                            <div className="flex items-center justify-center space-x-2 text-red-600">
                                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                                <span className="font-medium">Live Recording</span>
                            </div>
                        )}
                    </div>

                    {/* Control Buttons */}
                    <div className="flex flex-col items-center space-y-4">
                        {!isRecording && !audioBlob && (
                            <button
                                onClick={startRecording}
                                className="flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transform transition-all hover:scale-105"
                            >
                                <Mic className="w-6 h-6 mr-2" />
                                Start Recording
                            </button>
                        )}

                        {isRecording && (
                            <div className="flex space-x-4">
                                <button
                                    onClick={pauseRecording}
                                    className="flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-lg transition-all"
                                >
                                    {isPaused ? (
                                        <>
                                            <Play className="w-5 h-5 mr-2" />
                                            Resume
                                        </>
                                    ) : (
                                        <>
                                            <Pause className="w-5 h-5 mr-2" />
                                            Pause
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={stopRecording}
                                    className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                                >
                                    <Square className="w-5 h-5 mr-2" />
                                    Stop
                                </button>
                            </div>
                        )}

                        {audioBlob && !isProcessing && (
                            <div className="space-y-4 w-full">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <p className="text-green-800 font-medium">
                                        Recording completed! Duration: {formatTime(recordingTime)}
                                    </p>
                                </div>

                                <div className="flex space-x-4 justify-center">
                                    <button
                                        onClick={saveRecording}
                                        className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        Save & Process
                                    </button>

                                    <button
                                        onClick={discardRecording}
                                        className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5 mr-2" />
                                        Discard
                                    </button>
                                </div>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="text-center space-y-4">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 font-medium">
                                    Processing your recording...
                                </p>
                                <p className="text-gray-500 text-sm">
                                    Transcribing audio and generating medical summary
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    {!isRecording && !audioBlob && (
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                                Recording Tips
                            </h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</span>
                                    <span>Ensure you're in a quiet environment for best transcription quality</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</span>
                                    <span>Speak clearly and at a moderate pace</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</span>
                                    <span>Allow the system to automatically identify doctor and patient speakers</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</span>
                                    <span>Review the transcription and summary after processing</span>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}