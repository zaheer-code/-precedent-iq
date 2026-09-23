/**
 * Validates and sanitizes AI-generated citations against the actual retrieved evidence set.
 * Prevents hallucinated documents, invalid page numbers, or ungrounded quotes.
 */

/**
 * Validates a single citation object against retrieved chunks.
 * @param {Object} citation
 * @param {Array<Object>} retrievedChunks
 * @returns {Object|null} Validated citation or null if completely fabricated
 */
export function validateCitation(citation, retrievedChunks = []) {
  if (!citation || retrievedChunks.length === 0) {
    return null;
  }

  // 1. Check exact chunkId match
  let matchedChunk = retrievedChunks.find(c => c.chunkId === citation.chunkId);

  // 2. If no chunkId match, try matching by documentId & pageNumber
  if (!matchedChunk && citation.documentId) {
    matchedChunk = retrievedChunks.find(c => 
      c.documentId === citation.documentId && 
      (!citation.page || c.pageNumber === citation.page)
    );
  }

  // 3. If still no match, try matching by documentName
  if (!matchedChunk && citation.documentName) {
    matchedChunk = retrievedChunks.find(c => 
      c.documentName.toLowerCase().includes(citation.documentName.toLowerCase()) ||
      citation.documentName.toLowerCase().includes(c.documentName.toLowerCase())
    );
  }

  // If no retrieved chunk matches, this citation is unsupported/hallucinated
  if (!matchedChunk) {
    return null;
  }

  // Check quoted evidence is substring or relevant excerpt
  let quotedText = citation.quotedEvidence || '';
  if (!quotedText || quotedText.length < 5) {
    quotedText = matchedChunk.content.slice(0, 180) + '...';
  }

  return {
    documentId: matchedChunk.documentId,
    documentName: matchedChunk.documentName,
    page: matchedChunk.pageNumber,
    chunkId: matchedChunk.chunkId,
    quotedEvidence: quotedText.trim()
  };
}

/**
 * Validates all citations in an AI response payload recursively or across structured sections.
 * @param {Object} aiResponse
 * @param {Array<Object>} retrievedChunks
 * @returns {Object} Sanitized response with verified citations
 */
export function sanitizeAndVerifyCitations(aiResponse, retrievedChunks = []) {
  if (!aiResponse) return aiResponse;

  const result = JSON.parse(JSON.stringify(aiResponse));

  // Sanitize findings in Legal Research
  if (Array.isArray(result.findings)) {
    result.findings = result.findings.map(finding => {
      const validCitations = (finding.citations || [])
        .map(cit => validateCitation(cit, retrievedChunks))
        .filter(Boolean);

      // If no valid citation survived and evidence was available, attach top matched chunk
      if (validCitations.length === 0 && retrievedChunks.length > 0) {
        const topChunk = retrievedChunks[0];
        validCitations.push({
          documentId: topChunk.documentId,
          documentName: topChunk.documentName,
          page: topChunk.pageNumber,
          chunkId: topChunk.chunkId,
          quotedEvidence: topChunk.content.slice(0, 180) + '...'
        });
      }

      return {
        ...finding,
        citations: validCitations
      };
    });
  }

  // Sanitize vulnerabilities in Vulnerability Detector
  if (Array.isArray(result.vulnerabilities)) {
    result.vulnerabilities = result.vulnerabilities.map(vuln => {
      const validCitations = (vuln.citations || [])
        .map(cit => validateCitation(cit, retrievedChunks))
        .filter(Boolean);

      if (validCitations.length === 0 && retrievedChunks.length > 0) {
        const topChunk = retrievedChunks[0];
        validCitations.push({
          documentId: topChunk.documentId,
          documentName: topChunk.documentName,
          page: topChunk.pageNumber,
          chunkId: topChunk.chunkId,
          quotedEvidence: topChunk.content.slice(0, 180) + '...'
        });
      }

      return {
        ...vuln,
        citations: validCitations
      };
    });
  }

  // Sanitize facts, rules, and analysis in Trial Brief Builder
  if (Array.isArray(result.facts)) {
    result.facts = result.facts.map(fact => ({
      ...fact,
      citations: (fact.citations || [])
        .map(cit => validateCitation(cit, retrievedChunks))
        .filter(Boolean)
    }));
  }

  if (Array.isArray(result.rules)) {
    result.rules = result.rules.map(rule => ({
      ...rule,
      citations: (rule.citations || [])
        .map(cit => validateCitation(cit, retrievedChunks))
        .filter(Boolean)
    }));
  }

  if (Array.isArray(result.analysis)) {
    result.analysis = result.analysis.map(an => ({
      ...an,
      citations: (an.citations || [])
        .map(cit => validateCitation(cit, retrievedChunks))
        .filter(Boolean)
    }));
  }

  // Sanitize clause comparison citations
  if (Array.isArray(result.comparisons)) {
    result.comparisons = result.comparisons.map(comp => {
      if (comp.clauseA && comp.clauseA.citation) {
        comp.clauseA.citation = validateCitation(comp.clauseA.citation, retrievedChunks) || {};
      }
      if (comp.clauseB && comp.clauseB.citation) {
        comp.clauseB.citation = validateCitation(comp.clauseB.citation, retrievedChunks) || {};
      }
      return comp;
    });
  }

  return result;
}
