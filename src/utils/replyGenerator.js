const AUTO_REPLY_POOL = [
  'Got it, thanks for letting me know!',
  'Sounds like a plan 👍',
  'Let me check and get back to you in a bit.',
  'Awesome, talk soon!',
  'That works great for me.',
  'Thanks! Will keep you posted.',
];

export function pickContextualReply(outgoingText, contactName) {
  const lower = outgoingText.toLowerCase();
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    return 'Hey! How is it going?';
  }
  if (lower.includes('?')) {
    return 'Good question — let me double check and get right back to you.';
  }
  if (lower.includes('thank')) {
    return 'You are very welcome! 😊';
  }
  if (lower.includes('call') || lower.includes('meet') || lower.includes('lunch')) {
    return 'Sure thing! Just let me know when you are free.';
  }
  if (contactName && contactName.toLowerCase().includes('bank')) {
    return 'Automated Alert: Your message has been received. Reply HELP for assistance.';
  }
  const index = outgoingText.length % AUTO_REPLY_POOL.length;
  return AUTO_REPLY_POOL[index];
}
