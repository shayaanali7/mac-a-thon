require("dotenv").config();
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://app.backboard.io/api";

const headers = {
  "Content-Type": "application/json",
  "X-API-Key": process.env.BACKBOARD_API_KEY,
};

/* =======================================================
   HELPERS
======================================================= */

async function handle(res) {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json();
}


/* =======================================================
   ASSISTANTS
======================================================= */

// Create
async function createAnalyzerAssistant() {
  const res = await fetch(`${BASE_URL}/assistants`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "Doctor Analyzer Assistant Gemini",
      system_prompt: `You are a medical conversation analyzer. Respond only in valid JSON format with the following structure:

{{
  "doctor_speaker": "speaker_0 or speaker_1",
  "patient_speaker": "speaker_0 or speaker_1",
  "chief_complaint": "detailed reason for the visit",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "diagnosis": "detailed diagnosis with reasoning based on symptoms discussed in the conversation",
  "medications": [
    {{
      "name": "medication name",
      "dosage": "amount (e.g., 500mg)",
      "frequency": "how often (e.g., twice daily, every 8 hours)",
      "duration": "how long (e.g., 7 days, 2 weeks)",
      "instructions": "any special instructions mentioned"
    }}
  ],
  "follow_up": "any follow-up instructions or appointments mentioned",
  "additional_notes": "any other relevant medical information discussed"
}}

Important guidelines:
- For diagnosis: provide a detailed explanation with reasoning based on the symptoms and discussion in the conversation (2-3 sentences minimum)
- For medications: include ALL details mentioned - name, dosage, frequency, duration, and any special instructions
- If medication timeframe is mentioned (e.g., "take for 10 days"), include it in the duration field
- If no medications were prescribed, use an empty array []
- Be thorough and capture all medical details from the conversation
- Use actual medical terminology when appropriate

Return ONLY the JSON object, no markdown formatting, no extra text.`,
      embedding_provider: "google",
      embedding_model_name: "gemini-embedding-001-1536",
      model_name: "gemini-2.5-pro",
    }),
  });
  return handle(res);
}

async function createChatAssistant() {
  const res = await fetch(`${BASE_URL}/assistants`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "Chat Assistant Gemini",
      system_prompt: `You are a helpful medical assistant that can answer questions about patient medical records and conversation transcripts.

Guidelines:
- Answer questions clearly and conversationally
- If you have access to documents or context, use that information to answer questions
- If you don't have enough information to answer a question, say so clearly and ask for clarification or additional details
- When you do have medical information available, be specific (mention dates, dosages, diagnoses as they appear)
- Be professional but friendly in tone
- When discussing medications, include dosage, frequency, and duration if that information is available
- If no context is available, you can still have helpful conversations about general medical topics or help clarify what information would be needed

You can answer questions like:
- "What medications am I currently taking?" (if medical records are available)
- "When was my last appointment?" (if appointment history is available)
- "What did the doctor diagnose me with?" (if conversation transcript is available)
- General medical questions when specific records aren't available

Always be helpful, honest about what information you have access to, and maintain a supportive tone.`,
      embedding_provider: "google",
      embedding_model_name: "gemini-embedding-001-1536",
      model_name: "gemini-2.5-pro",
    }),
  });
  return handle(res);
}

// List
async function listAssistants() {
  const res = await fetch(`${BASE_URL}/assistants`, { headers });
  return handle(res);
}

// Get
async function getAssistant(assistantId) {
  const res = await fetch(`${BASE_URL}/assistants/${assistantId}`, { headers });
  return handle(res);
}

// Update
async function updateAssistant(assistantId, data) {
  const res = await fetch(`${BASE_URL}/assistants/${assistantId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  return handle(res);
}

// Delete
async function deleteAssistant(assistantId) {
  const res = await fetch(`${BASE_URL}/assistants/${assistantId}`, {
    method: "DELETE",
    headers,
  });
  return res.ok;
}

// List Assistant Threads
async function listThreadsForAssistant(assistantId) {
  const res = await fetch(
    `${BASE_URL}/assistants/${assistantId}/threads`,
    { headers }
  );
  return handle(res);
}

// List Assistant Documents
async function listAssistantDocuments(assistantId) {
  const res = await fetch(
    `${BASE_URL}/assistants/${assistantId}/documents`,
    { headers }
  );
  return handle(res);
}

// Upload Document to Assistant
async function uploadAssistantDocument(assistantId, filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), path.basename(filePath));

  const res = await fetch(
    `${BASE_URL}/assistants/${assistantId}/documents`,
    {
      method: "POST",
      headers: { "X-API-Key": process.env.BACKBOARD_API_KEY }, // no content-type
      body: form,
    }
  );

  return handle(res);
}


/* =======================================================
   THREADS
======================================================= */

// Create thread
async function createThread(assistantId) {
  const res = await fetch(
    `${BASE_URL}/assistants/${assistantId}/threads`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    }
  );
  return handle(res);
}

// async function deleteAllThreads() {
//   try {
//     const threads = await listThreads();

//     if (!threads || threads.length === 0) {
//       console.log("No threads to delete");
//       return { deleted: 0 };
//     }

//     const deletePromises = threads.map(async (thread) => {
//       const { statusCode } = await request(`${BASE_URL}/threads/${thread.id}`, {
//         method: 'DELETE',
//         headers: {
//           'X-API-Key': process.env.BACKBOARD_API_KEY
//         }
//       });
//       return statusCode === 200 || statusCode === 204;
//     });

//     await Promise.all(deletePromises);

//     console.log(`Successfully deleted ${threads.length} threads`);
//     return { deleted: threads.length };
//   } catch (err) {
//     console.error("Error deleting all threads:", err);
//     throw err;
//   }
// }

// List all threads
async function listThreads() {
  const res = await fetch(`${BASE_URL}/threads`, { headers });
  return handle(res);
}

// Get thread
async function getThread(threadId) {
  const res = await fetch(`${BASE_URL}/threads/${threadId}`, { headers });
  return handle(res);
}

// Delete thread
async function deleteThread(threadId) {
  const res = await fetch(`${BASE_URL}/threads/${threadId}`, {
    method: "DELETE",
    headers,
  });
  return res.ok;
}

// List thread documents
async function listThreadDocuments(threadId) {
  const res = await fetch(
    `${BASE_URL}/threads/${threadId}/documents`,
    { headers }
  );
  return handle(res);
}


/* =======================================================
   MESSAGES
======================================================= */

const { request, FormData } = require('undici');

async function sendMessageAnalyzer(threadId, transcriptArray) {
  // Format the transcript into a readable conversation format
  const formattedTranscript = transcriptArray
    .map(segment => `${segment.speakerId}: ${segment.text}`)
    .join('\n');

  // Create the prompt with the transcript
  const content = `Analyze the following medical conversation transcript and respond ONLY with valid JSON in the exact format specified in your system prompt.

TRANSCRIPT:
${formattedTranscript}`;

  const form = new FormData();

  form.append("content", content);
  form.append("llm_provider", "google");
  form.append("model_name", "gemini-2.5-pro");
  form.append("stream", "false");
  form.append("memory", "Auto");
  form.append("web_search", "off");
  form.append("send_to_llm", "true");
  form.append("metadata", "{}");

  try {
    const { statusCode, body } = await request(`${BASE_URL}/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        Accept: '*/*',
        "X-API-Key": process.env.BACKBOARD_API_KEY,
      },
      body: form
    });

    const data = await body.json();

    if (statusCode !== 200) {
      console.error("Error sending message:", statusCode, data);
      return null;
    }

    console.log("Message sent successfully. Status:", statusCode);

    // Parse the JSON response from the LLM
    try {
      // Strip markdown code blocks if present
      let cleanedContent = data.content.trim();

      // Remove ```json and ``` markers
      cleanedContent = cleanedContent.replace(/^```json\s*\n?/i, '');
      cleanedContent = cleanedContent.replace(/\n?```\s*$/, '');
      cleanedContent = cleanedContent.trim();

      const parsedContent = JSON.parse(cleanedContent);
      return parsedContent;
    } catch (parseErr) {
      console.error("Failed to parse LLM response as JSON:", data.content);
      return null; // Return null instead of raw data
    }

  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

async function sendMessageChat(threadId, userPrompt) {
  const form = new FormData();

  form.append("content", userPrompt);
  form.append("llm_provider", "google");
  form.append("model_name", "gemini-2.5-pro");
  form.append("stream", "false");
  form.append("memory", "Auto");
  form.append("web_search", "off");
  form.append("send_to_llm", "true");
  form.append("metadata", "{}");

  try {
    const { statusCode, body } = await request(`${BASE_URL}/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        Accept: '*/*',
        "X-API-Key": process.env.BACKBOARD_API_KEY,
      },
      body: form
    });

    const data = await body.json();

    if (statusCode !== 200) {
      console.error("Error sending message:", statusCode, data);
      return null;
    }

    console.log("Message sent successfully. Status:", statusCode);

    // Return the conversational response directly
    return {
      content: data.content,
      message_id: data.message_id,
      thread_id: data.thread_id,
      retrieved_memories: data.retrieved_memories,
      retrieved_files: data.retrieved_files
    };

  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}


/* =======================================================
   DOCUMENTS
======================================================= */

// Upload to thread
async function uploadDocument(threadId, filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), path.basename(filePath));

  const res = await fetch(
    `${BASE_URL}/threads/${threadId}/documents`,
    {
      method: "POST",
      headers: { "X-API-Key": process.env.BACKBOARD_API_KEY },
      body: form,
    }
  );

  return handle(res);
}

// Delete
async function deleteDocument(documentId) {
  const res = await fetch(`${BASE_URL}/documents/${documentId}`, {
    method: "DELETE",
    headers,
  });
  return res.ok;
}

// Status
async function getDocumentStatus(documentId) {
  const res = await fetch(
    `${BASE_URL}/documents/${documentId}/status`,
    { headers }
  );
  return handle(res);
}


/* =======================================================
   MEMORIES
======================================================= */

// List memories
async function listMemories() {
  const res = await fetch(`${BASE_URL}/memories`, { headers });
  return handle(res);
}

// Add memory
async function addMemory(data) {
  const res = await fetch(`${BASE_URL}/memories`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return handle(res);
}

// Get memory
async function getMemory(id) {
  const res = await fetch(`${BASE_URL}/assistants/${id}/memories`, { headers });
  return handle(res);
}

// Update memory
async function updateMemory(id, data) {
  const res = await fetch(`${BASE_URL}/memories/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  return handle(res);
}

// Delete memory
async function deleteMemory(id) {
  const res = await fetch(`${BASE_URL}/memories/${id}`, {
    method: "DELETE",
    headers,
  });
  return res.ok;
}

// Memory stats
async function getMemoryStats() {
  const res = await fetch(`${BASE_URL}/memories/stats`, { headers });
  return handle(res);
}

// Memory operation status
async function getMemoryOperationStatus(opId) {
  const res = await fetch(`${BASE_URL}/memories/operations/${opId}`, {
    headers,
  });
  return handle(res);
}


/* =======================================================
   EXPORTS
======================================================= */

module.exports = {
  // assistants
  createAnalyzerAssistant,
  createChatAssistant,
  listAssistants,
  getAssistant,
  updateAssistant,
  deleteAssistant,
  listThreadsForAssistant,
  listAssistantDocuments,
  uploadAssistantDocument,

  // threads
  createThread,
  //   deleteAllThreads,
  listThreads,
  getThread,
  deleteThread,
  listThreadDocuments,

  // messages
  sendMessageAnalyzer,
  sendMessageChat,

  // documents
  uploadDocument,
  deleteDocument,
  getDocumentStatus,

  // memories
  listMemories,
  addMemory,
  getMemory,
  updateMemory,
  deleteMemory,
  getMemoryStats,
  getMemoryOperationStatus,
};
