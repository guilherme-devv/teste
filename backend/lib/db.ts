export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  verificationCode?: string;
  identityStatus: "pending" | "submitted" | "approved" | "rejected";
  documentUrls?: string[];
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: Date;
}

const users: User[] = [];
const sessions: Session[] = [];

export const db = {
  users: {
    findByEmail: (email: string) => {
      return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    },
    findById: (id: string) => {
      return users.find((u) => u.id === id);
    },
    create: (user: User) => {
      users.push(user);
      return user;
    },
    update: (id: string, updates: Partial<User>) => {
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      users[index] = { ...users[index], ...updates, updatedAt: new Date() };
      return users[index];
    },
    getAll: () => {
      return users;
    },
  },
  sessions: {
    create: (session: Session) => {
      sessions.push(session);
      return session;
    },
    findByToken: (token: string) => {
      return sessions.find((s) => s.token === token && s.expiresAt > new Date());
    },
    deleteByToken: (token: string) => {
      const index = sessions.findIndex((s) => s.token === token);
      if (index !== -1) {
        sessions.splice(index, 1);
      }
    },
  },
};
