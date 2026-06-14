'use strict';

const Groq = require('groq-sdk');

/**
 * Groq API service wrapper
 * Handles text completions and vision (image) completions.
 * All prompts are expected to return JSON where indicated.
 */

const MODEL_TEXT   = 'llama-3.3-70b-versatile';
const MODEL_VISION = 'meta-llama/llama-4-scout-17b-16e-instruct';

// Simple in-memory response cache (key → {data, expiresAt})
const _cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let _clients = [];
let _currentIndex = 0;

/**
 * Parses GROQ_API_KEY as a comma-separated list and initializes multiple clients.
 * Throws clearly if no keys are found.
 */
function initClients() {
  if (_clients.length === 0) {
    const keyString = process.env.GROQ_API_KEY || '';
    const keys = keyString.split(',').map(k => k.trim()).filter(k => k);
    
    if (keys.length === 0) {
      throw new Error('GROQ_API_KEY is not set. Please add it to your .env file.');
    }
    _clients = keys.map(apiKey => new Groq({ apiKey }));
  }
}

/**
 * Executes a Groq API call, automatically rotating to the next API key 
 * if a rate limit (429) or authentication error (401/403) occurs.
 */
async function withRetry(operation) {
  initClients();
  let attempts = 0;
  let lastError = null;

  while (attempts < _clients.length) {
    try {
      const client = _clients[_currentIndex];
      return await operation(client);
    } catch (err) {
      lastError = err;
      const status = err.status || err.response?.status;
      
      // If rate limited or auth failed, rotate to the next key
      if (status === 429 || status === 401 || status === 403) {
        console.warn(`[Groq] Key index ${_currentIndex} failed (Status: ${status}). Rotating to next key...`);
        _currentIndex = (_currentIndex + 1) % _clients.length;
        attempts++;
      } else {
        // Don't retry on bad requests or malformed payloads
        throw err;
      }
    }
  }
  
  throw new Error(`[Groq] All ${_clients.length} API key(s) exhausted. Last error: ${lastError.message}`);
}

/**
 * Get a cached value, or null if missing / expired.
 * @param {string} key
 */
function getCached(key) {
  const entry = _cache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  _cache.delete(key);
  return null;
}

/**
 * Store a value in the cache.
 * @param {string} key
 * @param {*} data
 */
function setCached(key, data) {
  _cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Call the Groq text completion API.
 * @param {Array<{role:string, content:string}>} messages
 * @param {object} [options]
 * @param {boolean} [options.json=false]       Expect JSON output
 * @param {number}  [options.maxTokens=1024]   Max tokens to generate
 * @param {number}  [options.temperature=0.3]  Sampling temperature
 * @param {boolean} [options.cache=true]       Cache identical requests
 * @returns {Promise<string>} Raw text content
 */
async function complete(messages, options = {}) {
  const {
    json        = false,
    maxTokens   = 1024,
    temperature = 0.3,
    cache       = true,
  } = options;

  const cacheKey = cache ? JSON.stringify({ messages, maxTokens, temperature }) : null;
  if (cacheKey) {
    const hit = getCached(cacheKey);
    if (hit) return hit;
  }

  const params = {
    model:      MODEL_TEXT,
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (json) params.response_format = { type: 'json_object' };

  const completion = await withRetry((client) => client.chat.completions.create(params));
  const content = completion.choices[0]?.message?.content ?? '';

  if (cacheKey) setCached(cacheKey, content);
  return content;
}

/**
 * Call the Groq vision API with a base64-encoded image.
 * @param {string} base64Image   Base64-encoded image (no data URI prefix)
 * @param {string} mimeType      e.g. 'image/jpeg'
 * @param {string} prompt        Text instruction for the model
 * @param {object} [options]
 * @param {boolean} [options.json=false]
 * @param {number}  [options.maxTokens=2048]
 * @returns {Promise<string>} Raw text content
 */
async function analyzeImage(base64Image, mimeType, prompt, options = {}) {
  const { json = false, maxTokens = 2048 } = options;

  const params = {
    model:      MODEL_VISION,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type:      'image_url',
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens:  maxTokens,
  };
  if (json) params.response_format = { type: 'json_object' };

  const completion = await withRetry((client) => client.chat.completions.create(params));
  return completion.choices[0]?.message?.content ?? '';
}

/**
 * Parse a JSON string returned by Groq, with fallback.
 * Groq may occasionally wrap JSON in markdown fences.
 * @param {string} raw
 * @returns {object}
 */
function parseJSON(raw) {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { complete, analyzeImage, parseJSON };
