import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatNameFromEmail,
  formatShortTime,
  pickAvatarColor,
  sortThreads,
} from '../src/utils/formatters.js';

test('sortThreads places pinned threads first and orders by updatedAt descending', () => {
  const input = [
    { id: '1', isPinned: false, updatedAt: 100 },
    { id: '2', isPinned: true, updatedAt: 50 },
    { id: '3', isPinned: false, updatedAt: 300 },
    { id: '4', isPinned: true, updatedAt: 200 },
  ];

  const sorted = sortThreads(input);
  assert.deepEqual(
    sorted.map((t) => t.id),
    ['4', '2', '3', '1']
  );
  assert.deepEqual(
    input.map((t) => t.id),
    ['1', '2', '3', '4']
  );
});

test('formatNameFromEmail parses dotted and single-part emails', () => {
  assert.deepEqual(formatNameFromEmail('alex.morgan@example.com'), {
    name: 'Alex Morgan',
    initials: 'AM',
  });
  assert.deepEqual(formatNameFromEmail('hartej@example.com'), {
    name: 'Hartej',
    initials: 'HA',
  });
  assert.deepEqual(formatNameFromEmail(''), {
    name: 'User',
    initials: 'US',
  });
});

test('pickAvatarColor returns a deterministic hex color string', () => {
  const c1 = pickAvatarColor('Alex Morgan');
  const c2 = pickAvatarColor('Alex Morgan');
  assert.equal(c1, c2);
  assert.match(c1, /^#[0-9A-Fa-f]{6}$/);
});

test('formatShortTime formats a Date object into a non-empty time string', () => {
  const result = formatShortTime(new Date(2026, 0, 1, 14, 5));
  assert.equal(typeof result, 'string');
  assert.ok(result.length >= 4);
});
