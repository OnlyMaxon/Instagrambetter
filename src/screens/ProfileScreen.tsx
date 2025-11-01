import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import dataService from '../services/dataService';
import { User, Post } from '../types';

export default function ProfileScreen() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    const user = await dataService.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const userPosts = await dataService.getPostsByUserId(user.id);
      setPosts(userPosts);
    }
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dataService.logout();
            // App.tsx will handle navigation to login
          },
        },
      ]
    );
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
      <View style={styles.gridOverlay}>
        <View style={styles.gridStats}>
          <Ionicons name="heart" size={20} color="#fff" />
          <Text style={styles.gridStatText}>{item.likes.length}</Text>
        </View>
        <View style={styles.gridStats}>
          <Ionicons name="chatbubble" size={20} color="#fff" />
          <Text style={styles.gridStatText}>{item.comments.length}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{currentUser.username}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: currentUser.profilePicture }} style={styles.profilePic} />
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{posts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentUser.followers.length}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentUser.following.length}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.fullName}>{currentUser.fullName}</Text>
            {currentUser.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="grid" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="play-circle-outline" size={24} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="person-outline" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {posts.length > 0 ? (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.gridContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="camera-outline" size={64} color="#ccc" />
            </View>
            <Text style={styles.emptyText}>No Posts Yet</Text>
            <Text style={styles.emptySubtext}>
              Share your first photo or video
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profilePic: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginRight: 20,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileInfo: {
    marginBottom: 15,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  editButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  gridContainer: {
    paddingTop: 1,
  },
  gridItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    opacity: 0,
  },
  gridStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  gridStatText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
