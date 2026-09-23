import test from 'node:test';
import assert from 'node:assert/strict';
import { chunkDocumentPages } from '../src/services/documents/chunker.js';

test('Document Chunker & Page Preservation Suite', async (t) => {

  await t.test('Preserves page numbers and chunk indices across multi-page document', () => {
    const mockPages = [
      {
        pageNumber: 1,
        pageId: 'page-uuid-1',
        text: 'This is the first sentence on page 1 of the settlement agreement. The parties agreed to confidential arbitration.'
      },
      {
        pageNumber: 2,
        pageId: 'page-uuid-2',
        text: 'Section 4.2 governing indemnification on page 2. Defendant shall hold harmless the plaintiff from all claims.'
      }
    ];

    const chunks = chunkDocumentPages(mockPages);

    assert.ok(chunks.length >= 2, 'Should generate at least 2 chunks');
    assert.equal(chunks[0].pageNumber, 1, 'First chunk should be on page 1');
    assert.equal(chunks[0].chunkIndex, 0, 'First chunk should have index 0');
    assert.equal(chunks[1].pageNumber, 2, 'Second chunk should be on page 2');
    assert.equal(chunks[1].chunkIndex, 1, 'Second chunk should have index 1');
    assert.ok(chunks[0].tokenCount > 0, 'Token count should be greater than 0');
  });

  await t.test('Splits long paragraphs into overlapping sentence chunks without losing content', () => {
    const longText = 'The defendant entered into the initial agreement on January 15, 2024. '.repeat(20);
    const mockPages = [
      {
        pageNumber: 1,
        pageId: 'page-uuid-long',
        text: longText
      }
    ];

    const chunks = chunkDocumentPages(mockPages);
    assert.ok(chunks.length > 1, 'Long text should be segmented into multiple chunks');

    for (const chunk of chunks) {
      assert.equal(chunk.pageNumber, 1, 'All generated chunks from page 1 must retain pageNumber 1');
      assert.ok(chunk.content.length > 0, 'Chunk content must not be empty');
      assert.ok(chunk.tokenCount > 0, 'Chunk token count must be calculated');
    }
  });

  await t.test('Gracefully ignores empty pages', () => {
    const mockPages = [
      { pageNumber: 1, text: '' },
      { pageNumber: 2, text: '   ' },
      { pageNumber: 3, text: 'Valid page 3 text' }
    ];

    const chunks = chunkDocumentPages(mockPages);
    assert.equal(chunks.length, 1);
    assert.equal(chunks[0].pageNumber, 3);
  });

});
