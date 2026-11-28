import { sessionStorage } from './sessionStorage';
import { messageStorage } from './messageStorage';

export const storageService = {
  ...sessionStorage,
  ...messageStorage,

  async exportBackupData() {
    const [session, settings, threads] = await Promise.all([
      sessionStorage.getSession(),
      sessionStorage.getSettings(),
      messageStorage.getThreads(),
    ]);

    const messagesByThread = {};
    await Promise.all(
      threads.map(async (thread) => {
        messagesByThread[thread.id] = await messageStorage.getMessages(thread.id);
      })
    );

    const backupPayload = {
      exportedAt: new Date().toISOString(),
      user: session ? { name: session.name, email: session.email } : null,
      settings,
      threads,
      messagesByThread,
    };

    return JSON.stringify(backupPayload, null, 2);
  },
};
