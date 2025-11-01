export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  password: string;
  profilePicture: string;
  bio: string;
  followers: string[];
  following: string[];
  posts: string[];
  stories: string[];
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  location?: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  likes: string[];
}

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  createdAt: string;
  expiresAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  targetId: string;
  fromUserId: string;
  text: string;
  createdAt: string;
  read: boolean;
}
