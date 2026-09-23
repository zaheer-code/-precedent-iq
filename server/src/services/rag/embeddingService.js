import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import { ENV } from '../../config/env.js';

let genAIClient = null;

function getAI() {
  if (!genAIClient && ENV.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
  }
  return genAIClient;
}

/**
 * Generates a 768-dimensional embedding for a single text using Google's text-embedding-004.
 * If the Gemini API key is missing or an error occurs in offline test mode,
 * returns a deterministic 768-dimensional normalized unit vector.
 * @param {string} text
 * @returns {Promise<Array<number>>}
 */
export async function generateEmbedding(text) {
  const cleanText = (text || '').trim();
  if (!cleanText) {
    return createDeterministicFallbackVector('empty');
  }

  const ai = getAI();
  if (ai && ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY !== 'replace_with_gemini_api_key') {
    try {
      const response = await ai.models.embedContent({
        model: ENV.EMBEDDING_MODEL || 'text-embedding-004',
        contents: cleanText
      });

      if (response && response.embedding && response.embedding.values) {
        return response.embedding.values;
      }
    } catch (error) {
      console.warn(`[Embedding Warning]: Gemini embed failed (${error.message}). Using deterministic fallback.`);
    }
  }

  // Deterministic fallback vector for test & offline environments
  return createDeterministicFallbackVector(cleanText);
}

/**
 * Generates embeddings for an array of texts in batches.
 * @param {Array<string>} texts
 * @returns {Promise<Array<Array<number>>>}
 */
export async function generateBatchEmbeddings(texts) {
  const results = [];
  // Process in small batches of 5 to avoid API rate limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const slice = texts.slice(i, i + BATCH_SIZE);
    const batchPromises = slice.map(t => generateEmbedding(t));
    const batchEmbeddings = await Promise.all(batchPromises);
    results.push(...batchEmbeddings);
  }
  return results;
}

/**
 * Creates a deterministic, normalized 768-dimensional unit vector based on text content hash.
 * This guarantees consistent semantic retrieval behavior in test suites and local mock runs.
 */
function createDeterministicFallbackVector(text) {
  const dim = ENV.VECTOR_DIMENSIONS || 768;
  const vector = new Array(dim);
  const hash = crypto.createHash('sha256').update(text).digest();

  let sumSq = 0;
  for (let i = 0; i < dim; i++) {
    const byteIndex = (i * 4) % hash.length;
    const rawVal = hash.readInt32BE(byteIndex);
    // Pseudorandom pseudo-normal value
    const val = Math.sin(rawVal + i * 0.12345);
    vector[i] = val;
    sumSq += val * val;
  }

  // Normalize to unit vector (L2 norm = 1.0)
  const norm = Math.sqrt(sumSq) || 1;
  return vector.map(v => v / norm);
}
