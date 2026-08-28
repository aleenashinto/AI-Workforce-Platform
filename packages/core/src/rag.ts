import { db } from "@ai-workforce/db";
import { sql } from "drizzle-orm";
import { rerankDocuments, generateEmbeddings } from "@ai-workforce/llm";

export interface RetrievedChunk {
  id: string;
  document_id: string;
  content: string;
  rrf_score: number;
}

export async function hybridSearchWithRRF(
  orgId: string,
  query: string,
  limit: number = 6
): Promise<RetrievedChunk[]> {
  // 1. Generate query embedding
  let queryEmbedding;
  try {
    const embeddings = await generateEmbeddings([query]);
    queryEmbedding = embeddings[0];
  } catch (err) {
    console.error("OpenAI Embedding failed, using dummy vector", err);
    queryEmbedding = new Array(3072).fill(0.01);
  }

  // 2. Perform Hybrid Search with Reciprocal Rank Fusion via Drizzle and Postgres
  // Since this runs within withTenant context in the route, RLS is naturally enforced.
  const searchResults = await db.execute(sql`
    WITH vector_search AS (
      SELECT id, document_id, content,
             1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity,
             ROW_NUMBER() OVER (ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as rank
      FROM knowledge_chunks
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT 30
    ),
    keyword_search AS (
      SELECT id, document_id, content,
             ts_rank_cd(fts, plainto_tsquery('english', ${query})) as rank_score,
             ROW_NUMBER() OVER (ORDER BY ts_rank_cd(fts, plainto_tsquery('english', ${query})) DESC) as rank
      FROM knowledge_chunks
      WHERE fts @@ plainto_tsquery('english', ${query})
      LIMIT 30
    ),
    fused_results AS (
      SELECT
        COALESCE(v.id, k.id) as id,
        COALESCE(v.document_id, k.document_id) as document_id,
        COALESCE(v.content, k.content) as content,
        COALESCE(1.0 / (60 + v.rank), 0.0) + COALESCE(1.0 / (60 + k.rank), 0.0) as rrf_score
      FROM vector_search v
      FULL OUTER JOIN keyword_search k ON v.id = k.id
      ORDER BY rrf_score DESC
      LIMIT 40
    )
    SELECT * FROM fused_results;
  `);

  const chunks = searchResults as any as RetrievedChunk[];
  
  if (chunks.length === 0) {
    return [];
  }

  // 3. Rerank using Cohere/Voyage
  try {
    const documentsText = chunks.map((c) => c.content);
    const reranked = await rerankDocuments(query, documentsText);
    
    // reranked contains { document, index, relevance_score }
    // We map it back to our chunks and sort by relevance_score
    const finalResults = reranked
      .map((r) => chunks[r.index])
      .slice(0, limit);
      
    return finalResults;
  } catch (err) {
    console.error("Reranking failed, falling back to top RRF chunks:", err);
    return chunks.slice(0, limit);
  }
}
