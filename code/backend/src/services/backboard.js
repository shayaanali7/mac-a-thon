const { request } = require('undici');
require("dotenv").config();

const BASE_URL = "https://app.backboard.io/api";

const headers = {
  "Content-Type": "application/json",
  "X-API-Key": process.env.BACKBOARD_API_KEY
};

async function createAssistant() {
  const res = await fetch(`${BASE_URL}/assistants`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "Doctor Assistant",
      system_prompt: "Summarize doctor-patient conversations clearly.",
      model: 'gemini-2.5-pro'
    })
  });

  const data = await res.json();
  return data;
}

// create thread
async function createThread(assistantId) {
  const res = await fetch(
    `${BASE_URL}/assistants/${assistantId}/threads`,
    {
      method: "POST",
      headers
    }
  );

  return res.json();
}

// send message
async function sendMessage(threadId, content) {
  const res = await fetch(
    `${BASE_URL}/threads/${threadId}/messages`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        content,
        stream: false,
        memory: "Auto"
      })
    }
  );

  return res.json();
}

async function listAssistants() {
  try {
    const { statusCode, body } = await request(`${BASE_URL}/assistants`, {
      headers
    });

    if (statusCode !== 200) {
      console.error('Failed to fetch assistants, status:', statusCode);
      return;
    }

    const data = await body.json();
    console.log('Assistants:', data);
    return data;
  } catch (err) {
    console.error('Error fetching assistants:', err);
  }
}

async function deleteAssistant(assistantId) {
  try {
    const { statusCode, body } = await request(`${BASE_URL}/assistants/${assistantId}`, {
      method: 'DELETE',
      headers
    });

    if (statusCode !== 200 && statusCode !== 204) {
      console.error(`Failed to delete assistant ${assistantId}, status:`, statusCode);
      return;
    }

    console.log(`Assistant ${assistantId} deleted successfully.`);
    return true;
  } catch (err) {
    console.error('Error deleting assistant:', err);
  }
}

async function listModels() {
  try {
    const { statusCode, body } = await request(`${BASE_URL}/models/provider/google`, {
      headers
    });

    if (statusCode !== 200) {
      console.error('Failed to fetch models, status:', statusCode);
      return;
    }

    const data = await body.json();
    console.log('Models:', data);
    return data;
  } catch (err) {
    console.error('Error fetching models:', err);
  }
};

module.exports = {
  createAssistant,
  createThread,
  sendMessage,
  listAssistants,
  deleteAssistant,
  listModels,
};
