import test from 'node:test';
import assert from 'node:assert/strict';
import { pickContextualReply } from '../src/utils/replyGenerator.js';

test('pickContextualReply responds to greetings', () => {
  assert.equal(
    pickContextualReply('Hey there', 'Alex'),
    'Hey! How is it going?'
  );
});

test('pickContextualReply responds to questions', () => {
  assert.equal(
    pickContextualReply('Are we still on for today?', 'Alex'),
    'Good question — let me double check and get right back to you.'
  );
});

test('pickContextualReply responds to thanks and scheduling', () => {
  assert.equal(
    pickContextualReply('Thanks a lot', 'Alex'),
    'You are very welcome! 😊'
  );
  assert.equal(
    pickContextualReply('Want to grab lunch', 'Alex'),
    'Sure thing! Just let me know when you are free.'
  );
});

test('pickContextualReply returns bank alert for bank contacts', () => {
  assert.equal(
    pickContextualReply('Checking balance', 'Demo Bank'),
    'Automated Alert: Your message has been received. Reply HELP for assistance.'
  );
});

test('pickContextualReply falls back to deterministic pool reply', () => {
  const r1 = pickContextualReply('Status update', 'Alex');
  const r2 = pickContextualReply('Status update', 'Alex');
  assert.equal(r1, r2);
  assert.ok(r1.length > 0);
});
