import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import dataService from '../services/dataService';
import { User } from '../types';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await dataService.getCurrentUser();
    setCurrentUser(user);
    const users = await dataService.getUsers();
    setAllUsers(users.filter(u => u.id !== user?.id));
  };

  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim()) {
        const results = await dataService.searchUsers(searchQuery);
        setSearchResults(results.filter(u => u.id !== currentUser?.id));
      } else {
        setSearchResults([]);
      }
    };
    search();
  }, [searchQuery, currentUser]);

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;
    
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    if (user.followers.includes(currentUser.id)) {
      await dataService.unfollowUser(currentUser.id, userId);
    } else {
      await dataService.followUser(currentUser.id, userId);
      await dataService.createNotification({
        userId: userId,
        type: 'follow',
        targetId: currentUser.id,
        fromUserId: currentUser.id,
        text: `${currentUser.username} started following you`,
      });
    }
    await loadData();
  };

  const renderUser = ({ item }: { item: User }) => {
    const isFollowing = currentUser ? item.followers.includes(currentUser.id) : false;

    return (
      <View style={styles.userItem}>
        <Image source={{ uri: item.profilePicture }} style={styles.profilePic} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.fullName}>{item.fullName}</Text>
        </View>
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={() => handleFollow(item.id)}
        >
          <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const displayUsers = searchQuery.trim() ? searchResults : allUsers;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={displayUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'No users found' : 'No users to display'}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  fullName: {
    fontSize: 14,
    color: '#999',
  },
  followButton: {
    backgroundColor: '#3897f0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  followingButtonText: {
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});
