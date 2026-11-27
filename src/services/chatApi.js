import { AVATAR_COLORS } from './mockData';

const BASE_URL = 'https://dummyjson.com';

const SAMPLE_TIMESTAMPS = [
  '10:42',
  '09:18',
  'Yesterday',
  'Yesterday',
  '25 Nov',
  '24 Nov',
  '23 Nov',
  '22 Nov',
];

export const chatApi = {
  async fetchRemoteThreadsAndContacts() {
    const [usersRes, commentsRes] = await Promise.all([
      fetch(`${BASE_URL}/users?limit=12`),
      fetch(`${BASE_URL}/comments?limit=30`),
    ]);

    if (!usersRes.ok || !commentsRes.ok) {
      throw new Error('Failed to fetch data from DummyJSON API');
    }

    const usersJson = await usersRes.json();
    const commentsJson = await commentsRes.json();

    const users = Array.isArray(usersJson.users) ? usersJson.users : [];
    const comments = Array.isArray(commentsJson.comments)
      ? commentsJson.comments
      : [];

    const threadUsers = users.slice(0, 7);
    const directoryUsers = users.slice(7);

    const threads = [];
    const messagesByThread = {};

    threadUsers.forEach((user, idx) => {
      const threadId = `dummy_thread_${user.id}`;
      const c1 = comments[idx * 2];
      const c2 = comments[idx * 2 + 1];
      const timeLabel = SAMPLE_TIMESTAMPS[idx % SAMPLE_TIMESTAMPS.length];

      const msgs = [];
      if (c1) {
        msgs.push({
          id: `dummy_m_${user.id}_1`,
          threadId,
          text: c1.body,
          sender: 'them',
          timestamp: timeLabel,
          status: 'read',
        });
      }
      if (c2) {
        msgs.push({
          id: `dummy_m_${user.id}_2`,
          threadId,
          text: c2.body,
          sender: idx % 2 === 0 ? 'me' : 'them',
          timestamp: timeLabel,
          status: 'read',
        });
      }

      const lastMsg = msgs[msgs.length - 1];
      threads.push({
        id: threadId,
        contactName: `${user.firstName} ${user.lastName}`.trim(),
        phoneNumber: user.phone || '+1 (555) 010-0000',
        avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
        avatarUrl: user.image || null,
        lastMessage: lastMsg ? lastMsg.text : 'Say hello!',
        timestamp: timeLabel,
        unreadCount: idx < 2 ? 1 : 0,
        isPinned: idx === 0,
        category: idx % 3 === 0 ? 'business' : 'personal',
      });

      messagesByThread[threadId] = msgs;
    });

    const directoryContacts = directoryUsers.map((user, idx) => ({
      id: `dummy_dir_${user.id}`,
      contactName: `${user.firstName} ${user.lastName}`.trim(),
      phoneNumber: user.phone || '+1 (555) 010-0000',
      avatarColor: AVATAR_COLORS[(idx + 4) % AVATAR_COLORS.length],
      avatarUrl: user.image || null,
      category: 'personal',
    }));

    return { threads, messagesByThread, directoryContacts };
  },

  async postSimulatedMessage(text, postId = 1, userId = 1) {
    try {
      const res = await fetch(`${BASE_URL}/comments/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: text,
          postId,
          userId,
        }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async fetchRandomReply() {
    try {
      const skip = Math.floor(Math.random() * 150);
      const res = await fetch(`${BASE_URL}/comments?limit=1&skip=${skip}`);
      if (!res.ok) return null;
      const json = await res.json();
      const first = json?.comments?.[0];
      return first?.body || null;
    } catch {
      return null;
    }
  },
};
