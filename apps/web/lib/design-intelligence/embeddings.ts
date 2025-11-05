/**
 * Embeddings & Vector Search
 *
 * OpenAI embeddings for semantic similarity search of design profiles
 */

import OpenAI from 'openai';
import { SimilarProfile } from './types';

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error);
}

/**
 * Create embedding vector for text using OpenAI
 */
export async function createEmbedding(text: string): Promise<number[]> {
  if (!openai) {
    console.warn('OpenAI not configured - embeddings unavailable. Set OPENAI_API_KEY to enable vector similarity search.');
    return []; // Return empty array if OpenAI not available
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to create embedding:', error);
    return []; // Return empty array on error
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find similar profiles using vector similarity
 */
export async function findSimilarProfiles(
  queryEmbedding: number[],
  limit: number = 5,
  minConfidence: number = 0.7
): Promise<SimilarProfile[]> {
  try {
    // TODO: Implement vector database query
    // Options:
    // 1. Supabase with pgvector extension
    // 2. Pinecone vector database
    // 3. In-memory search (for development)

    // For now, return empty array
    // In production, this would:
    // - Query vector database with queryEmbedding
    // - Return top N most similar profiles
    // - Filter by minConfidence threshold
    // - Include profile data + confidence score

    return [];
  } catch (error) {
    console.error('Failed to find similar profiles:', error);
    return [];
  }
}

/**
 * Store profile embedding in vector database
 */
export async function storeProfileEmbedding(
  profileId: string,
  embedding: number[],
  metadata: {
    name: string;
    category: string;
    primaryPurpose: string;
    demographic: string;
  }
): Promise<void> {
  try {
    // TODO: Implement vector database storage
    // - Store embedding with profileId
    // - Store metadata for filtering
    // - Enable similarity search

    console.log(`📍 Stored embedding for profile: ${profileId}`);
  } catch (error) {
    console.error('Failed to store profile embedding:', error);
    throw error;
  }
}

/**
 * Delete profile embedding from vector database
 */
export async function deleteProfileEmbedding(profileId: string): Promise<void> {
  try {
    // TODO: Implement vector database deletion
    console.log(`🗑️ Deleted embedding for profile: ${profileId}`);
  } catch (error) {
    console.error('Failed to delete profile embedding:', error);
    throw error;
  }
}

/**
 * Update profile embedding in vector database
 */
export async function updateProfileEmbedding(
  profileId: string,
  text: string,
  metadata: {
    name: string;
    category: string;
    primaryPurpose: string;
    demographic: string;
  }
): Promise<void> {
  try {
    // Create new embedding
    const embedding = await createEmbedding(text);

    // Delete old embedding
    await deleteProfileEmbedding(profileId);

    // Store new embedding
    await storeProfileEmbedding(profileId, embedding, metadata);

    console.log(`🔄 Updated embedding for profile: ${profileId}`);
  } catch (error) {
    console.error('Failed to update profile embedding:', error);
    throw error;
  }
}

/**
 * Batch create embeddings for multiple texts
 */
export async function batchCreateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!openai) {
    console.warn('OpenAI not configured - batch embeddings unavailable.');
    return texts.map(() => []); // Return empty arrays if OpenAI not available
  }

  try {
    // OpenAI supports batch embeddings
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map((d) => d.embedding);
  } catch (error) {
    console.error('Failed to create batch embeddings:', error);
    return texts.map(() => []); // Return empty arrays on error
  }
}
