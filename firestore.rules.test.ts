/**
 * Security Rules Specification Verification Suite — Dirty Dozen Matrix
 * Validates expected PERMISSION_DENIED outcomes against firestore.rules.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED' | 'ALLOW';
}

export const DIRTY_DOZEN_PAYLOADS: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated CMS Post Creation',
    collectionPath: '/posts/hack-1',
    operation: 'create',
    auth: null,
    payload: { title: 'Unauthorized', status: 'published' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Email Spoof Admin Escalation (email_verified=false)',
    collectionPath: '/site_settings/main',
    operation: 'update',
    auth: { uid: 'spoof-1', email: 'fathurelgani@gmail.com', email_verified: false },
    payload: { heroTitle: 'Hijacked Portal' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on Program',
    collectionPath: '/programs/prog-1',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'fathurelgani@gmail.com', email_verified: true },
    payload: { code: 'S1-PAI', isSuperVerified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'ID Poisoning Attack',
    collectionPath: '/posts/invalid$id!with*badchars',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'fathurelgani@gmail.com', email_verified: true },
    payload: { title: 'Valid Title' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Identity Spoofing on Post',
    collectionPath: '/posts/post-1',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'fathurelgani@gmail.com', email_verified: true },
    payload: { title: 'Spoofed Author', authorId: 'other-user-uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Client Timestamp Forgery',
    collectionPath: '/agenda/evt-1',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'fathurelgani@gmail.com', email_verified: true },
    payload: { title: 'Backdated Event', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Immutable Field Tampering on Post',
    collectionPath: '/posts/post-1',
    operation: 'update',
    auth: { uid: 'admin-1', email: 'fathurelgani@gmail.com', email_verified: true },
    payload: { authorId: 'changed-owner' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Value Poisoning Oversized Content',
    collectionPath: '/posts/post-1',
    operation: 'update',
    auth: { uid: 'admin-1', email: 'fathurelgani@gmail.com', email_verified: true },
    payload: { content: 'A'.repeat(15000) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Draft Post Scraping by Public Visitor',
    collectionPath: '/posts/draft-secret',
    operation: 'get',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Non-Admin Self-Promotion',
    collectionPath: '/admins/regular-user',
    operation: 'create',
    auth: { uid: 'regular-user', email: 'student@example.com', email_verified: true },
    payload: { displayName: 'Student', role: 'super_admin', addedBy: 'regular-user' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Analytics Event Forgery',
    collectionPath: '/analytics_events/ev-1',
    operation: 'create',
    auth: { uid: 'regular-user', email: 'student@example.com', email_verified: true },
    payload: { eventType: 'page_view', label: 'home', actorId: 'victim-uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Terminal State Bypass on Completed Agenda',
    collectionPath: '/agenda/evt-done',
    operation: 'update',
    auth: { uid: 'regular-user', email: 'student@example.com', email_verified: true },
    payload: { status: 'upcoming' },
    expected: 'PERMISSION_DENIED',
  },
];
