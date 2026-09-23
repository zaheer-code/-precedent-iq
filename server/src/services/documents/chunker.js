/**
 * Intelligent paragraph and sentence-aware document chunker.
 * Preserves page references, chunk indices, and token approximations.
 */

const TARGET_CHUNK_SIZE = 700; // characters
const CHUNK_OVERLAP = 100; // characters

/**
 * Splits document pages into semantic chunks.
 * @param {Array<{pageNumber: number, pageId?: string, text: string}>} pages
 * @returns {Array<{chunkIndex: number, pageNumber: number, pageId?: string, content: string, tokenCount: number}>}
 */
export function chunkDocumentPages(pages) {
  const allChunks = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const { pageNumber, pageId, text } = page;
    if (!text || text.trim().length === 0) continue;

    const pageChunks = chunkPageText(text, TARGET_CHUNK_SIZE, CHUNK_OVERLAP);

    for (const chunkText of pageChunks) {
      if (chunkText.trim().length === 0) continue;
      
      allChunks.push({
        chunkIndex: globalChunkIndex++,
        pageNumber,
        pageId: pageId || null,
        content: chunkText.trim(),
        tokenCount: Math.ceil(chunkText.length / 4)
      });
    }
  }

  return allChunks;
}

/**
 * Chunks a single page of text using paragraphs and sentences.
 */
function chunkPageText(text, targetSize, overlap) {
  // If the page is small enough, keep as single chunk
  if (text.length <= targetSize + overlap) {
    return [text];
  }

  const chunks = [];
  // Split into paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';

  for (const para of paragraphs) {
    const cleanPara = para.trim();
    if (!cleanPara) continue;

    // If a single paragraph is longer than target size, split by sentences
    if (cleanPara.length > targetSize) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      const sentenceChunks = splitLongParagraph(cleanPara, targetSize, overlap);
      chunks.push(...sentenceChunks);
      continue;
    }

    if (currentChunk.length + cleanPara.length + 2 > targetSize) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        // Add overlap from previous chunk
        const overlapText = currentChunk.slice(-overlap);
        currentChunk = overlapText + '\n\n' + cleanPara;
      } else {
        currentChunk = cleanPara;
      }
    } else {
      currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + cleanPara;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Splits a long paragraph by sentence boundaries.
 */
function splitLongParagraph(paragraph, targetSize, overlap) {
  // Sentence regex matching punctuation followed by space
  const sentences = paragraph.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [paragraph];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    if (!cleanSentence) continue;

    if (currentChunk.length + cleanSentence.length + 1 > targetSize) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        const overlapText = currentChunk.slice(-overlap);
        currentChunk = overlapText + ' ' + cleanSentence;
      } else {
        chunks.push(cleanSentence);
        currentChunk = '';
      }
    } else {
      currentChunk += (currentChunk.length > 0 ? ' ' : '') + cleanSentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
