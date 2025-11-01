import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import dataService from '../services/dataService';
import { Notification, User } from '../types';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    const user = await dataService.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const userNotifications = await dataService.getNotificationsByUserId(user.id);
      setNotifications(userNotifications);

      // Load user data
      const allUsers = await dataService.getUsers();
      const usersMap: { [key: string]: User } = {};
      allUsers.forEach(u => {
        usersMap[u.id] = u;
      });
      setUsers(usersMap);
    }
    setRefreshing(false);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;
    
    const user = users[userId];
    if (!user) return;

    if (user.followers.includes(currentUser.id)) {
      await dataService.unfollowUser(currentUser.id, userId);
    } else {
      await dataService.followUser(currentUser.id, userId);
    }
    await loadData();
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const fromUser = users[item.fromUserId];
    if (!fromUser) return null;

    const isFollowing = currentUser ? fromUser.followers.includes(currentUser.id) : false;

    let icon: keyof typeof Ionicons.glyphMap = 'notifications';
    let iconColor = '#000';

    switch (item.type) {
      case 'like':
        icon = 'heart';
        iconColor = '#ed4956';
        break;
      case 'comment':
        icon = 'chatbubble';
        iconColor = '#3897f0';
        break;
      case 'follow':
        icon = 'person-add';
        iconColor = '#000';
        break;
    }

    return (
      <TouchableOpacity 
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        onPress={() => {
          if (!item.read) {
            dataService.markNotificationAsRead(item.id);
            loadData();
          }
        }}
      >
        <Image source={{ uri: fromUser.profilePicture }} style={styles.profilePic} />
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{fromUser.username}</Text>{' '}
            {item.type === 'like' && 'liked your post'}
            {item.type === 'comment' && 'commented on your post'}
            {item.type === 'follow' && 'started following you'}
          </Text>
          <Text style={styles.timestamp}>{getTimeAgo(new Date(item.createdAt))}</Text>
        </View>
        {item.type === 'follow' && (
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => handleFollow(item.fromUserId)}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
        <Ionicons name={icon} size={24} color={iconColor} style={styles.icon} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={loadData}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              When someone likes or comments on your posts, you'll see it here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 18,
  },
  username: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  icon: {
    marginLeft: 10,
  },
  followButton: {
    backgroundColor: '#3897f0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 5,
    marginLeft: 10,
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  followingButtonText: {
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
