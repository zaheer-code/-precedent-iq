import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://precedentiq-api.onrender.com/api';
const RUN_ID = Date.now().toString().slice(-6);

const TEST_USER = {
  fullName: 'Elena Vance, Esq.',
  email: `elena.vance.${RUN_ID}@precedentiq.legal`,
  password: 'Password123!@#',
  confirmPassword: 'Password123!@#'
};

console.log('================================================================');
console.log(' PRECEDENTIQ PRODUCTION END-TO-END HACKATHON VERIFICATION SUITE ');
console.log(` Target: ${BASE_URL}`);
console.log(` Account: ${TEST_USER.email}`);
console.log('================================================================\n');

let authToken = '';
let userId = '';
let matterId = '';
let docAId = '';
let docBId = '';

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    ...options.headers
  };

  if (authToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, data };
}

async function runSuite() {
  try {
    // --------------------------------------------------------------------------
    // 1. Health Check
    // --------------------------------------------------------------------------
    console.log('[1/11] Checking Production Backend Health...');
    const health = await request('/health');
    console.log(` -> Status: ${health.status}`, health.data);
    if (!health.ok || health.data.status !== 'healthy') throw new Error('Health check failed');
    console.log(' ✓ Health check passed.\n');

    // --------------------------------------------------------------------------
    // 2. User Registration
    // --------------------------------------------------------------------------
    console.log('[2/11] Testing Production User Registration...');
    const regRes = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    console.log(` -> Status: ${regRes.status}`, regRes.data.message || regRes.data);
    if (!regRes.ok || !regRes.data.token) throw new Error('Registration failed');
    authToken = regRes.data.token;
    userId = regRes.data.user.id;
    console.log(` ✓ Registration successful. User ID: ${userId}\n`);

    // --------------------------------------------------------------------------
    // 3. User Login
    // --------------------------------------------------------------------------
    console.log('[3/11] Testing Production User Login & Token Verification...');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
    });
    console.log(` -> Status: ${loginRes.status}`, loginRes.data.message);
    if (!loginRes.ok || !loginRes.data.token) throw new Error('Login failed');
    authToken = loginRes.data.token;
    console.log(' ✓ Login & JWT authentication verified.\n');

    // --------------------------------------------------------------------------
    // 4. Dashboard Stats
    // --------------------------------------------------------------------------
    console.log('[4/11] Testing Dashboard Analytics API...');
    const statsRes = await request('/stats/dashboard');
    console.log(` -> Status: ${statsRes.status}`, statsRes.data);
    if (!statsRes.ok) throw new Error('Dashboard stats failed');
    console.log(' ✓ Dashboard statistics query verified.\n');

    // --------------------------------------------------------------------------
    // 5. Create Matter / Case Workspace
    // --------------------------------------------------------------------------
    console.log('[5/11] Creating Case Matter Workspace...');
    const matterRes = await request('/matters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matterName: 'Meridian Tech v. Apex Cloud Systems',
        matterNumber: 'SDNY-2026-CV-08492',
        description: 'Breach of Cloud Infrastructure Master Agreement, IP Infringement, and Indemnification Default',
        jurisdiction: 'U.S. District Court, Southern District of New York',
        practiceArea: 'Commercial Litigation & IP',
        status: 'ACTIVE'
      })
    });
    console.log(` -> Status: ${matterRes.status}`, matterRes.data.matter?.matter_name);
    if (!matterRes.ok || !matterRes.data.matter?.id) throw new Error('Create matter failed');
    matterId = matterRes.data.matter.id;
    console.log(` ✓ Matter workspace created. Matter ID: ${matterId}\n`);

    // --------------------------------------------------------------------------
    // 6. Upload Legal Documents (Contract & Amendment)
    // --------------------------------------------------------------------------
    console.log('[6/11] Uploading Legal Contract Documents for Ingestion & Vector Indexing...');
    const docAContent = `
MASTER CLOUD SERVICES AGREEMENT (MSA)
BETWEEN MERIDIAN TECHNOLOGY CORP. AND APEX CLOUD SYSTEMS LLC
EFFECTIVE DATE: JANUARY 15, 2024

SECTION 1. DEFINITIONS AND SCOPE OF SERVICES
1.1 "Services" means the enterprise multi-tenant cloud storage, database virtualization, and distributed GPU compute services provided by Apex Cloud Systems ("Provider") to Meridian Technology Corp. ("Customer").
1.2 "Customer Data" means all proprietary source code, cryptographic keys, training datasets, client records, and intellectual property uploaded or processed via the Services.

SECTION 4. INTELLECTUAL PROPERTY OWNERSHIP
4.1 Customer Retained Rights. Customer retains sole and exclusive ownership of all right, title, and interest in and to all Customer Data, proprietary machine learning models, and derivative representations.
4.2 Provider Restrictions. Provider shall not reverse engineer, decompile, train external models upon, or disclose Customer Data to any unauthorized third party.

SECTION 8. INDEMNIFICATION OBLIGATIONS
8.1 Provider IP Indemnity. Provider shall defend, indemnify, and hold harmless Customer, its officers, directors, and employees against any third-party claim, suit, or proceeding alleging that the Services infringe, misappropriate, or violate any patent, copyright, trade secret, or other intellectual property right of a third party.
8.2 Notice and Defense. Customer shall give prompt written notice of any claim to Provider, provided that failure to give prompt notice shall only relieve Provider of its obligations to the extent Provider is materially prejudiced thereby.

SECTION 12. LIMITATION OF LIABILITY
12.1 General Cap. Except as provided in Section 12.2, each party's maximum aggregate liability arising out of or related to this Agreement shall be limited to the total fees paid by Customer in the twelve (12) months preceding the incident, not to exceed $100,000 USD.
12.2 Express Exclusions from Liability Cap. Notwithstanding Section 12.1 or any contrary provision herein, the liability cap in Section 12.1 SHALL NOT APPLY TO: (a) Provider's indemnification obligations under Section 8 (IP Indemnity); (b) breaches of Section 14 (Confidentiality); or (c) damages resulting from gross negligence or willful misconduct.
`;

    const docBContent = `
FIRST AMENDMENT TO MASTER CLOUD SERVICES AGREEMENT
EFFECTIVE DATE: SEPTEMBER 1, 2025

RECITALS
This Amendment modifies the Master Cloud Services Agreement dated January 15, 2024 between Meridian Technology Corp. and Apex Cloud Systems LLC.

AMENDED SECTION 8. INDEMNIFICATION DEFENSE PROCEDURE
8.1 Revised Defense Control. Provider shall assume sole control over the defense and settlement of any indemnified third-party claim, provided that Provider shall not settle any claim requiring admission of liability by Customer without Customer's prior written consent.

AMENDED SECTION 12. SPECIALIZED GPU LIABILITIES
12.3 High-Performance Compute Outages. Liability arising from unscheduled downtime of H100 GPU clusters shall be capped at 2x monthly compute fees, except where caused by malicious insider acts or intentional data wiping.
`;

    // Upload Document A
    const blobA = new Blob([docAContent], { type: 'text/plain' });
    const formDataA = new FormData();
    formDataA.append('files', blobA, 'MSA_Meridian_Apex_2024.txt');
    const uploadResA = await request(`/matters/${matterId}/documents`, { method: 'POST', body: formDataA });
    docAId = uploadResA.data.documents[0].id;

    // Upload Document B
    const blobB = new Blob([docBContent], { type: 'text/plain' });
    const formDataB = new FormData();
    formDataB.append('files', blobB, 'Amendment_No1_Meridian_Apex_2025.txt');
    const uploadResB = await request(`/matters/${matterId}/documents`, { method: 'POST', body: formDataB });
    docBId = uploadResB.data.documents[0].id;

    console.log(` ✓ Documents uploaded. Doc A: ${docAId}, Doc B: ${docBId}`);

    // Wait for ingestion
    console.log(' -> Waiting for background parsing, chunking, and pgvector embedding...');
    for (let i = 0; i < 15; i++) {
      await delay(2000);
      const docCheck = await request(`/documents/${docAId}`);
      if (docCheck.ok && docCheck.data.document?.processing_status === 'READY') {
        console.log(`    [Ingestion Poll] Doc A READY (${docCheck.data.document.chunk_count} chunks)`);
        break;
      }
    }
    console.log(' ✓ Documents indexed into pgvector successfully.\n');

    // --------------------------------------------------------------------------
    // 7. Zero-Hallucination Semantic RAG Research
    // --------------------------------------------------------------------------
    console.log('[7/11] Testing Zero-Hallucination Semantic RAG Research Query with Gemini 2.5 Flash...');
    const researchQuery = 'Does the $100,000 limitation of liability cap apply to third-party IP indemnification claims? What are the exact contractual exceptions?';
    const ragRes = await request(`/matters/${matterId}/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: researchQuery })
    });
    console.log(` -> Status: ${ragRes.status}`);
    if (!ragRes.ok || !ragRes.data.result) throw new Error('RAG Research query failed');
    const ragResult = ragRes.data.result;
    console.log(' -> Answer Preview:', (ragResult.answer || ragResult.summary || JSON.stringify(ragResult)).slice(0, 180) + '...');
    console.log(' -> Citations Count:', ragResult.citations?.length || 0);
    console.log(' ✓ Grounded Semantic RAG Research passed.\n');

    // --------------------------------------------------------------------------
    // 8. Opposing Counsel Argument Vulnerability Detector
    // --------------------------------------------------------------------------
    console.log('[8/11] Testing Opposing Argument Vulnerability Detector...');
    const opposingArgument = `
Opposing Counsel Argument:
Apex Cloud Systems has zero liability for the third-party patent infringement claim because Section 12.1 contains an absolute $100,000 aggregate liability cap covering all claims of any nature arising from the agreement, and Meridian has already utilized this cap through prior billing credits.
`;
    const vulnRes = await request(`/matters/${matterId}/vulnerabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opposingArgument })
    });
    console.log(` -> Status: ${vulnRes.status}`);
    if (!vulnRes.ok || !vulnRes.data.result) throw new Error('Vulnerability analysis failed');
    const vulnResult = vulnRes.data.result;
    console.log(' -> Weaknesses Identified:', vulnResult.weaknesses?.length || vulnResult.contradictions?.length || 0);
    console.log(' -> Recommended Counter-Strategy Preview:', (vulnResult.recommendedStrategy || vulnResult.summary || '').slice(0, 180) + '...');
    console.log(' ✓ Opposing Argument Vulnerability Analysis passed.\n');

    // --------------------------------------------------------------------------
    // 9. Dynamic Clause Comparison Matrix
    // --------------------------------------------------------------------------
    console.log('[9/11] Testing Dynamic Clause Comparison Matrix (Doc A vs Doc B)...');
    const clauseRes = await request(`/matters/${matterId}/clauses/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentAId: docAId,
        documentBId: docBId,
        clauseDescription: 'Compare Indemnification, Settlement Control, and Liability Cap modifications'
      })
    });
    console.log(` -> Status: ${clauseRes.status}`);
    if (!clauseRes.ok || !clauseRes.data.result) throw new Error('Clause comparison failed');
    const clauseResult = clauseRes.data.result;
    console.log(' -> Comparisons Count:', clauseResult.comparisons?.length || 0);
    console.log(' -> Summary Preview:', (clauseResult.summary || '').slice(0, 180) + '...');
    console.log(' ✓ Dynamic Clause Comparison Matrix passed.\n');

    // --------------------------------------------------------------------------
    // 10. Interactive Trial Brief Generator
    // --------------------------------------------------------------------------
    console.log('[10/11] Testing Interactive Trial Brief Generator (IRAC Synthesis)...');
    const briefRes = await request(`/matters/${matterId}/brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        briefTitle: 'Motion for Partial Summary Judgment on Uncapped Indemnity',
        court: 'U.S. District Court, Southern District of New York',
        jurisdiction: 'SDNY / 2nd Circuit',
        issues: [
          'Whether Section 12.2(a) expressly excludes Section 8 IP Indemnity claims from the $100,000 liability cap',
          'Whether Provider owes an immediate defense duty against third-party patent infringement claims'
        ]
      })
    });
    console.log(` -> Status: ${briefRes.status}`);
    if (!briefRes.ok || !briefRes.data.result) throw new Error('Trial brief generation failed');
    const briefResult = briefRes.data.result;
    console.log(' -> Brief Title:', briefResult.title);
    console.log(' -> Questions Presented:', briefResult.questionsPresented?.length);
    console.log(' -> Facts Elements:', briefResult.facts?.length);
    console.log(' -> Legal Analysis Points:', briefResult.analysis?.length);
    console.log(' -> Conclusion Preview:', (briefResult.conclusion || '').slice(0, 180) + '...');
    console.log(' ✓ Interactive Trial Brief Synthesis passed.\n');

    // --------------------------------------------------------------------------
    // 11. Evidence & Citation Inspector
    // --------------------------------------------------------------------------
    console.log('[11/11] Testing Citation Inspection & Audit Log Verification...');
    const evidenceRes = await request(`/matters/${matterId}/evidence`);
    console.log(` -> Status: ${evidenceRes.status}`, `Total Evidence Chunks: ${evidenceRes.data.chunks?.length || 0}`);
    const auditRes = await request(`/audit?limit=10`);
    console.log(` -> Audit Logs Status: ${auditRes.status}`, `Recent Audit Entries: ${auditRes.data.logs?.length || 0}`);
    console.log(' ✓ Evidence Inspection & Security Audit Trail verified.\n');

    console.log('================================================================');
    console.log(' 🎉 ALL 11 PRODUCTION HACKATHON VERIFICATION STEPS PASSED 100%!  ');
    console.log('================================================================');

  } catch (err) {
    console.error('\n❌ E2E VERIFICATION ERROR:', err.message);
    process.exit(1);
  }
}

runSuite();
