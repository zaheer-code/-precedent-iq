import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Parses a legal document and returns an array of pages with extracted text.
 * @param {string} filePath - Absolute path to the file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<Array<{pageNumber: number, text: string}>>}
 */
export async function parseDocument(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  if (mimeType === 'application/pdf' || ext === '.pdf') {
    return await parsePdf(filePath);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    ext === '.docx' ||
    ext === '.doc'
  ) {
    return await parseDocx(filePath);
  } else {
    // Default to plain text
    return await parseText(filePath);
  }
}

/**
 * Extracts page-by-page text from PDF files while preserving page numbers.
 */
async function parsePdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pages = [];

  // Custom page render handler to capture page by page
  const pageRender = function (pageData) {
    return pageData.getTextContent().then(function (textContent) {
      let lastY, text = '';
      for (const item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
          text += item.str + ' ';
        } else {
          text += '\n' + item.str + ' ';
        }
        lastY = item.transform[5];
      }
      return text;
    });
  };

  try {
    const data = await pdfParse(dataBuffer, { pagerender: pageRender });
    
    // Split by form feeds if pdf-parse returns aggregated text with page breaks (\f)
    const rawPages = data.text.split('\f');
    let pageNum = 1;
    
    for (const rawPage of rawPages) {
      const cleanText = normalizeText(rawPage);
      if (cleanText.length > 0) {
        pages.push({
          pageNumber: pageNum++,
          text: cleanText
        });
      }
    }

    // If no text was split via \f but data.text exists, wrap as page 1
    if (pages.length === 0 && data.text.trim().length > 0) {
      pages.push({
        pageNumber: 1,
        text: normalizeText(data.text)
      });
    }

    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        text: 'Document contains no extractable text.'
      });
    }

    return pages;
  } catch (error) {
    throw new Error(`Failed to parse PDF document: ${error.message}`);
  }
}

/**
 * Extracts text from DOCX files and divides into structured pages.
 */
async function parseDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = normalizeText(result.value);
    
    if (!text) {
      return [{ pageNumber: 1, text: 'Empty DOCX document.' }];
    }

    // Approximate pages by character count (approx 2500 chars / 400 words per page)
    const PAGE_CHAR_LIMIT = 2500;
    const paragraphs = text.split(/\n\s*\n/);
    const pages = [];
    let currentPageText = '';
    let pageNum = 1;

    for (const para of paragraphs) {
      if ((currentPageText.length + para.length > PAGE_CHAR_LIMIT) && currentPageText.length > 0) {
        pages.push({
          pageNumber: pageNum++,
          text: currentPageText.trim()
        });
        currentPageText = para + '\n\n';
      } else {
        currentPageText += para + '\n\n';
      }
    }

    if (currentPageText.trim().length > 0) {
      pages.push({
        pageNumber: pageNum,
        text: currentPageText.trim()
      });
    }

    return pages.length > 0 ? pages : [{ pageNumber: 1, text }];
  } catch (error) {
    throw new Error(`Failed to parse DOCX document: ${error.message}`);
  }
}

/**
 * Extracts plain text files and segments into logical pages.
 */
async function parseText(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const text = normalizeText(content);
    
    if (!text) {
      return [{ pageNumber: 1, text: 'Empty text document.' }];
    }

    // Split by form feeds if any, or divide into ~2500 character pages
    const rawPages = text.split(/\f/);
    if (rawPages.length > 1) {
      return rawPages.map((p, idx) => ({
        pageNumber: idx + 1,
        text: p.trim()
      })).filter(p => p.text.length > 0);
    }

    const PAGE_CHAR_LIMIT = 2500;
    const paragraphs = text.split(/\n\s*\n/);
    const pages = [];
    let currentPageText = '';
    let pageNum = 1;

    for (const para of paragraphs) {
      if ((currentPageText.length + para.length > PAGE_CHAR_LIMIT) && currentPageText.length > 0) {
        pages.push({
          pageNumber: pageNum++,
          text: currentPageText.trim()
        });
        currentPageText = para + '\n\n';
      } else {
        currentPageText += para + '\n\n';
      }
    }

    if (currentPageText.trim().length > 0) {
      pages.push({
        pageNumber: pageNum,
        text: currentPageText.trim()
      });
    }

    return pages.length > 0 ? pages : [{ pageNumber: 1, text }];
  } catch (error) {
    throw new Error(`Failed to read text file: ${error.message}`);
  }
}

/**
 * Normalizes extracted text: cleans up excessive whitespace and control characters.
 */
function normalizeText(str) {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
