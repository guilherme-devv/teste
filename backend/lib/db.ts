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

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls?: string[];
  mediaType?: "image" | "video";
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  likes: string[];
  commentsCount: number;
  sharesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Share {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}

const users: User[] = [];
const sessions: Session[] = [];
const posts: Post[] = [];
const comments: Comment[] = [];
const shares: Share[] = [];

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
  posts: {
    create: (post: Post) => {
      posts.push(post);
      return post;
    },
    findById: (id: string) => {
      return posts.find((p) => p.id === id);
    },
    findByUserId: (userId: string) => {
      return posts.filter((p) => p.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    getAll: (limit?: number, offset?: number) => {
      const sorted = posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      if (limit !== undefined && offset !== undefined) {
        return sorted.slice(offset, offset + limit);
      }
      return sorted;
    },
    getApproved: (limit?: number, offset?: number) => {
      const approved = posts.filter((p) => p.status === "approved").sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      if (limit !== undefined && offset !== undefined) {
        return approved.slice(offset, offset + limit);
      }
      return approved;
    },
    update: (id: string, updates: Partial<Post>) => {
      const index = posts.findIndex((p) => p.id === id);
      if (index === -1) return null;
      posts[index] = { ...posts[index], ...updates, updatedAt: new Date() };
      return posts[index];
    },
    delete: (id: string) => {
      const index = posts.findIndex((p) => p.id === id);
      if (index !== -1) {
        posts.splice(index, 1);
        return true;
      }
      return false;
    },
    toggleLike: (postId: string, userId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return null;
      const likeIndex = post.likes.indexOf(userId);
      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
      } else {
        post.likes.push(userId);
      }
      post.updatedAt = new Date();
      return post;
    },
    incrementComments: (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return null;
      post.commentsCount += 1;
      post.updatedAt = new Date();
      return post;
    },
    decrementComments: (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return null;
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      post.updatedAt = new Date();
      return post;
    },
    incrementShares: (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return null;
      post.sharesCount += 1;
      post.updatedAt = new Date();
      return post;
    },
  },
  comments: {
    create: (comment: Comment) => {
      comments.push(comment);
      return comment;
    },
    findById: (id: string) => {
      return comments.find((c) => c.id === id);
    },
    findByPostId: (postId: string) => {
      return comments.filter((c) => c.postId === postId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },
    update: (id: string, updates: Partial<Comment>) => {
      const index = comments.findIndex((c) => c.id === id);
      if (index === -1) return null;
      comments[index] = { ...comments[index], ...updates, updatedAt: new Date() };
      return comments[index];
    },
    delete: (id: string) => {
      const index = comments.findIndex((c) => c.id === id);
      if (index !== -1) {
        const comment = comments[index];
        comments.splice(index, 1);
        return comment;
      }
      return null;
    },
    toggleLike: (commentId: string, userId: string) => {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return null;
      const likeIndex = comment.likes.indexOf(userId);
      if (likeIndex > -1) {
        comment.likes.splice(likeIndex, 1);
      } else {
        comment.likes.push(userId);
      }
      comment.updatedAt = new Date();
      return comment;
    },
  },
  shares: {
    create: (share: Share) => {
      shares.push(share);
      return share;
    },
    findByPostId: (postId: string) => {
      return shares.filter((s) => s.postId === postId);
    },
    findByUserId: (userId: string) => {
      return shares.filter((s) => s.userId === userId);
    },
  },
};
