import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Post, Story, Message, Notification, Comment } from '../types';

class DataService {
  private static USERS_KEY = '@jalilgram_users';
  private static POSTS_KEY = '@jalilgram_posts';
  private static STORIES_KEY = '@jalilgram_stories';
  private static MESSAGES_KEY = '@jalilgram_messages';
  private static NOTIFICATIONS_KEY = '@jalilgram_notifications';
  private static CURRENT_USER_KEY = '@jalilgram_current_user';

  // Initialize with demo data if needed
  async initializeDemoData() {
    const users = await this.getUsers();
    if (users.length === 0) {
      const demoUsers: User[] = [
        {
          id: '1',
          username: 'jalil_user',
          fullName: 'Jalil User',
          email: 'jalil@example.com',
          password: 'demo123',
          profilePicture: 'https://via.placeholder.com/150/FF6B6B/ffffff?text=JU',
          bio: 'Welcome to JalilGram! 📸',
          followers: ['2', '3'],
          following: ['2'],
          posts: [],
          stories: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          username: 'demo_user',
          fullName: 'Demo User',
          email: 'demo@example.com',
          password: 'demo123',
          profilePicture: 'https://via.placeholder.com/150/4ECDC4/ffffff?text=DU',
          bio: 'Photography enthusiast 📷',
          followers: ['1'],
          following: ['1', '3'],
          posts: [],
          stories: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          username: 'test_user',
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'demo123',
          profilePicture: 'https://via.placeholder.com/150/95E1D3/ffffff?text=TU',
          bio: 'Just exploring JalilGram ✨',
          followers: ['1'],
          following: [],
          posts: [],
          stories: [],
          createdAt: new Date().toISOString(),
        },
      ];

      const demoPosts: Post[] = [
        {
          id: '1',
          userId: '2',
          imageUrl: 'https://via.placeholder.com/400/4ECDC4/ffffff?text=Post+1',
          caption: 'First post on JalilGram! 🎉',
          likes: ['1'],
          comments: [],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          userId: '2',
          imageUrl: 'https://via.placeholder.com/400/95E1D3/ffffff?text=Post+2',
          caption: 'Beautiful day! ☀️',
          likes: ['1', '3'],
          comments: [
            {
              id: '1',
              userId: '1',
              text: 'Amazing photo!',
              createdAt: new Date().toISOString(),
              likes: [],
            },
          ],
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ];

      await this.saveUsers(demoUsers);
      await this.savePosts(demoPosts);
    }
  }

  // User methods
  async getUsers(): Promise<User[]> {
    try {
      const data = await AsyncStorage.getItem(DataService.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async saveUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(DataService.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await this.saveUsers(users);
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      await this.saveUsers(users);
    }
  }

  async login(username: string, password: string): Promise<User | null> {
    const users = await this.getUsers();
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (user) {
      await AsyncStorage.setItem(DataService.CURRENT_USER_KEY, user.id);
      return user;
    }
    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userId = await AsyncStorage.getItem(DataService.CURRENT_USER_KEY);
      if (userId) {
        return await this.getUserById(userId);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(DataService.CURRENT_USER_KEY);
  }

  // Post methods
  async getPosts(): Promise<Post[]> {
    try {
      const data = await AsyncStorage.getItem(DataService.POSTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  async savePosts(posts: Post[]): Promise<void> {
    try {
      await AsyncStorage.setItem(DataService.POSTS_KEY, JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving posts:', error);
    }
  }

  async getPostById(id: string): Promise<Post | null> {
    const posts = await this.getPosts();
    return posts.find(p => p.id === id) || null;
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    const posts = await this.getPosts();
    return posts.filter(p => p.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    const posts = await this.getPosts();
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    posts.unshift(newPost);
    await this.savePosts(posts);
    
    // Update user's posts
    const user = await this.getUserById(post.userId);
    if (user) {
      await this.updateUser(user.id, {
        posts: [...user.posts, newPost.id],
      });
    }
    
    return newPost;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const posts = await this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      if (!post.likes.includes(userId)) {
        post.likes.push(userId);
        await this.savePosts(posts);
      }
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const posts = await this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.likes = post.likes.filter(id => id !== userId);
      await this.savePosts(posts);
    }
  }

  async addComment(postId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<void> {
    const posts = await this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      const newComment: Comment = {
        ...comment,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      post.comments.push(newComment);
      await this.savePosts(posts);
    }
  }

  // Story methods
  async getStories(): Promise<Story[]> {
    try {
      const data = await AsyncStorage.getItem(DataService.STORIES_KEY);
      const stories: Story[] = data ? JSON.parse(data) : [];
      // Filter out expired stories
      const now = new Date().getTime();
      const activeStories = stories.filter(s => new Date(s.expiresAt).getTime() > now);
      if (activeStories.length !== stories.length) {
        await this.saveStories(activeStories);
      }
      return activeStories;
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  }

  async saveStories(stories: Story[]): Promise<void> {
    try {
      await AsyncStorage.setItem(DataService.STORIES_KEY, JSON.stringify(stories));
    } catch (error) {
      console.error('Error saving stories:', error);
    }
  }

  async createStory(story: Omit<Story, 'id' | 'createdAt' | 'expiresAt'>): Promise<Story> {
    const stories = await this.getStories();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const newStory: Story = {
      ...story,
      id: Date.now().toString(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    stories.push(newStory);
    await this.saveStories(stories);
    return newStory;
  }

  async getStoriesByUserId(userId: string): Promise<Story[]> {
    const stories = await this.getStories();
    return stories.filter(s => s.userId === userId);
  }

  // Follow/Unfollow methods
  async followUser(followerId: string, followingId: string): Promise<void> {
    const users = await this.getUsers();
    const follower = users.find(u => u.id === followerId);
    const following = users.find(u => u.id === followingId);
    
    if (follower && following) {
      if (!follower.following.includes(followingId)) {
        follower.following.push(followingId);
      }
      if (!following.followers.includes(followerId)) {
        following.followers.push(followerId);
      }
      await this.saveUsers(users);
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const users = await this.getUsers();
    const follower = users.find(u => u.id === followerId);
    const following = users.find(u => u.id === followingId);
    
    if (follower && following) {
      follower.following = follower.following.filter(id => id !== followingId);
      following.followers = following.followers.filter(id => id !== followerId);
      await this.saveUsers(users);
    }
  }

  // Search methods
  async searchUsers(query: string): Promise<User[]> {
    const users = await this.getUsers();
    const lowerQuery = query.toLowerCase();
    return users.filter(
      u => u.username.toLowerCase().includes(lowerQuery) ||
           u.fullName.toLowerCase().includes(lowerQuery)
    );
  }

  // Messages methods
  async getMessages(): Promise<Message[]> {
    try {
      const data = await AsyncStorage.getItem(DataService.MESSAGES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async saveMessages(messages: Message[]): Promise<void> {
    try {
      await AsyncStorage.setItem(DataService.MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter(
      m => (m.senderId === userId1 && m.receiverId === userId2) ||
           (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async sendMessage(message: Omit<Message, 'id' | 'createdAt' | 'read'>): Promise<Message> {
    const messages = await this.getMessages();
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    messages.push(newMessage);
    await this.saveMessages(messages);
    return newMessage;
  }

  // Notifications methods
  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await AsyncStorage.getItem(DataService.NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async saveNotifications(notifications: Notification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(DataService.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const notifications = await this.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    notifications.push(newNotification);
    await this.saveNotifications(notifications);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notifications = await this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.saveNotifications(notifications);
    }
  }
}

export default new DataService();
