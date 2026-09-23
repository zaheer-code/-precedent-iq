import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCitation, sanitizeAndVerifyCitations } from '../src/services/rag/citationValidator.js';

test('Citation Verification & Anti-Hallucination Engine Suite', async (t) => {

  const mockRetrievedEvidence = [
    {
      chunkId: 'chunk-1111',
      documentId: 'doc-aaaa',
      documentName: 'Master_Services_Agreement.pdf',
      pageNumber: 4,
      content: 'Section 12.1: Either party may terminate this agreement upon 30 days written notice.'
    },
    {
      chunkId: 'chunk-2222',
      documentId: 'doc-bbbb',
      documentName: 'Deposition_Transcript.pdf',
      pageNumber: 18,
      content: 'Q: Did you send notice on March 1st? A: No, notice was sent on March 15th.'
    }
  ];

  await t.test('Validates citations matching exact chunkId from retrieved evidence', () => {
    const citation = {
      chunkId: 'chunk-1111',
      documentId: 'doc-aaaa',
      documentName: 'Master_Services_Agreement.pdf',
      page: 4,
      quotedEvidence: 'Either party may terminate this agreement'
    };

    const verified = validateCitation(citation, mockRetrievedEvidence);
    assert.ok(verified, 'Citation should be verified');
    assert.equal(verified.chunkId, 'chunk-1111');
    assert.equal(verified.page, 4);
    assert.equal(verified.documentId, 'doc-aaaa');
  });

  await t.test('Rejects fabricated citations referencing non-existent documents or chunks', () => {
    const hallucinatedCitation = {
      chunkId: 'fake-chunk-9999',
      documentId: 'fake-doc-9999',
      documentName: 'Supreme_Court_Fabricated_Holding.pdf',
      page: 105,
      quotedEvidence: 'A completely fabricated quote not in retrieved records'
    };

    const verified = validateCitation(hallucinatedCitation, mockRetrievedEvidence);
    assert.equal(verified, null, 'Hallucinated citation not in retrieved evidence must be rejected (return null)');
  });

  await t.test('Sanitizes full AI response payload by removing fabricated citations and anchoring real ones', () => {
    const aiResponse = {
      answer: 'The contract mandates 30 days notice.',
      findings: [
        {
          claim: 'Termination requires 30 days notice',
          explanation: 'Documented in master agreement',
          citations: [
            {
              chunkId: 'chunk-1111',
              documentName: 'Master_Services_Agreement.pdf',
              page: 4
            },
            {
              chunkId: 'completely-fake-chunk',
              documentName: 'Fake_Case_Law.pdf',
              page: 99
            }
          ]
        }
      ],
      conflicts: [],
      evidenceGaps: [],
      confidence: 'high'
    };

    const sanitized = sanitizeAndVerifyCitations(aiResponse, mockRetrievedEvidence);

    assert.equal(sanitized.findings[0].citations.length, 1, 'Only genuine citation should remain');
    assert.equal(sanitized.findings[0].citations[0].chunkId, 'chunk-1111');
    assert.equal(sanitized.findings[0].citations[0].page, 4);
  });

});
