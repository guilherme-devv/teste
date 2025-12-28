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

export interface Article {
  id: string;
  title: string;
  content: string;
  category: "alimentação" | "saúde" | "desenvolvimento" | "educação" | "comportamento";
  imageUrl?: string;
  videoUrl?: string;
  author: string;
  readTime: number;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: "feliz" | "cansado" | "preocupado" | "emocionado" | "grato";
  milestones: string[];
  mediaUrls?: string[];
  private: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  location: {
    city: string;
    state: string;
  };
  imageUrl?: string;
  memberIds: string[];
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: ChatMessage;
  updatedAt: Date;
  createdAt: Date;
}

export interface LocalService {
  id: string;
  name: string;
  category: "pediatra" | "escola" | "parque" | "loja" | "outro";
  description: string;
  address: string;
  phone?: string;
  website?: string;
  location: {
    city: string;
    state: string;
  };
  rating: number;
  reviews: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserReward {
  id: string;
  userId: string;
  points: number;
  level: number;
  badges: string[];
  activities: {
    type: "post" | "comment" | "like" | "share" | "diary";
    points: number;
    date: Date;
  }[];
  updatedAt: Date;
}

const users: User[] = [];
const sessions: Session[] = [];
const posts: Post[] = [];
const comments: Comment[] = [];
const shares: Share[] = [];
const articles: Article[] = [];
const diaryEntries: DiaryEntry[] = [];
const communities: Community[] = [];
const chatMessages: ChatMessage[] = [];
const conversations: Conversation[] = [];
const localServices: LocalService[] = [];
const userRewards: UserReward[] = [];

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
  articles: {
    create: (article: Article) => {
      articles.push(article);
      return article;
    },
    findById: (id: string) => {
      return articles.find((a) => a.id === id);
    },
    getAll: (category?: string) => {
      if (category) {
        return articles.filter((a) => a.category === category).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return articles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    toggleLike: (articleId: string, userId: string) => {
      const article = articles.find((a) => a.id === articleId);
      if (!article) return null;
      const likeIndex = article.likes.indexOf(userId);
      if (likeIndex > -1) {
        article.likes.splice(likeIndex, 1);
      } else {
        article.likes.push(userId);
      }
      article.updatedAt = new Date();
      return article;
    },
  },
  diaryEntries: {
    create: (entry: DiaryEntry) => {
      diaryEntries.push(entry);
      return entry;
    },
    findById: (id: string) => {
      return diaryEntries.find((e) => e.id === id);
    },
    findByUserId: (userId: string) => {
      return diaryEntries.filter((e) => e.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    update: (id: string, updates: Partial<DiaryEntry>) => {
      const index = diaryEntries.findIndex((e) => e.id === id);
      if (index === -1) return null;
      diaryEntries[index] = { ...diaryEntries[index], ...updates, updatedAt: new Date() };
      return diaryEntries[index];
    },
    delete: (id: string) => {
      const index = diaryEntries.findIndex((e) => e.id === id);
      if (index !== -1) {
        diaryEntries.splice(index, 1);
        return true;
      }
      return false;
    },
  },
  communities: {
    create: (community: Community) => {
      communities.push(community);
      return community;
    },
    findById: (id: string) => {
      return communities.find((c) => c.id === id);
    },
    getAll: () => {
      return communities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    findByLocation: (city: string, state: string) => {
      return communities.filter((c) => c.location.city === city && c.location.state === state);
    },
    addMember: (communityId: string, userId: string) => {
      const community = communities.find((c) => c.id === communityId);
      if (!community || community.memberIds.includes(userId)) return null;
      community.memberIds.push(userId);
      community.updatedAt = new Date();
      return community;
    },
    removeMember: (communityId: string, userId: string) => {
      const community = communities.find((c) => c.id === communityId);
      if (!community) return null;
      const index = community.memberIds.indexOf(userId);
      if (index > -1) {
        community.memberIds.splice(index, 1);
        community.updatedAt = new Date();
      }
      return community;
    },
  },
  conversations: {
    create: (conversation: Conversation) => {
      conversations.push(conversation);
      return conversation;
    },
    findById: (id: string) => {
      return conversations.find((c) => c.id === id);
    },
    findByUserId: (userId: string) => {
      return conversations.filter((c) => c.participantIds.includes(userId)).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    },
    findByParticipants: (userId1: string, userId2: string) => {
      return conversations.find((c) => c.participantIds.includes(userId1) && c.participantIds.includes(userId2) && c.participantIds.length === 2);
    },
    update: (id: string, updates: Partial<Conversation>) => {
      const index = conversations.findIndex((c) => c.id === id);
      if (index === -1) return null;
      conversations[index] = { ...conversations[index], ...updates, updatedAt: new Date() };
      return conversations[index];
    },
  },
  chatMessages: {
    create: (message: ChatMessage) => {
      chatMessages.push(message);
      return message;
    },
    findByConversationId: (conversationId: string) => {
      return chatMessages.filter((m) => m.conversationId === conversationId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },
    markAsRead: (conversationId: string, userId: string) => {
      chatMessages.forEach((m) => {
        if (m.conversationId === conversationId && m.senderId !== userId) {
          m.read = true;
        }
      });
    },
  },
  localServices: {
    create: (service: LocalService) => {
      localServices.push(service);
      return service;
    },
    findById: (id: string) => {
      return localServices.find((s) => s.id === id);
    },
    getAll: (category?: string) => {
      if (category) {
        return localServices.filter((s) => s.category === category);
      }
      return localServices;
    },
    findByLocation: (city: string, state: string) => {
      return localServices.filter((s) => s.location.city === city && s.location.state === state);
    },
  },
  userRewards: {
    create: (reward: UserReward) => {
      userRewards.push(reward);
      return reward;
    },
    findByUserId: (userId: string) => {
      return userRewards.find((r) => r.userId === userId);
    },
    addActivity: (userId: string, type: "post" | "comment" | "like" | "share" | "diary", points: number) => {
      let reward = userRewards.find((r) => r.userId === userId);
      if (!reward) {
        reward = {
          id: crypto.randomUUID(),
          userId,
          points: 0,
          level: 1,
          badges: [],
          activities: [],
          updatedAt: new Date(),
        };
        userRewards.push(reward);
      }
      reward.points += points;
      reward.activities.push({ type, points, date: new Date() });
      reward.level = Math.floor(reward.points / 100) + 1;
      reward.updatedAt = new Date();
      return reward;
    },
    addBadge: (userId: string, badge: string) => {
      const reward = userRewards.find((r) => r.userId === userId);
      if (!reward || reward.badges.includes(badge)) return null;
      reward.badges.push(badge);
      reward.updatedAt = new Date();
      return reward;
    },
  },
};
