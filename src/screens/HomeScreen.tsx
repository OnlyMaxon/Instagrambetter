import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import dataService from '../services/dataService';
import { Post, User } from '../types';

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    const user = await dataService.getCurrentUser();
    setCurrentUser(user);

    const allPosts = await dataService.getPosts();
    setPosts(allPosts);

    // Load user data for all posts
    const allUsers = await dataService.getUsers();
    const usersMap: { [key: string]: User } = {};
    allUsers.forEach(u => {
      usersMap[u.id] = u;
    });
    setUsers(usersMap);
    setRefreshing(false);
  };

  const handleLike = async (post: Post) => {
    if (!currentUser) return;

    if (post.likes.includes(currentUser.id)) {
      await dataService.unlikePost(post.id, currentUser.id);
    } else {
      await dataService.likePost(post.id, currentUser.id);
      if (post.userId !== currentUser.id) {
        await dataService.createNotification({
          userId: post.userId,
          type: 'like',
          targetId: post.id,
          fromUserId: currentUser.id,
          text: `${currentUser.username} liked your post`,
        });
      }
    }
    loadData();
  };

  const handleComment = async () => {
    if (!currentUser || !selectedPost || !commentText.trim()) return;

    await dataService.addComment(selectedPost.id, {
      userId: currentUser.id,
      text: commentText.trim(),
      likes: [],
    });

    if (selectedPost.userId !== currentUser.id) {
      await dataService.createNotification({
        userId: selectedPost.userId,
        type: 'comment',
        targetId: selectedPost.id,
        fromUserId: currentUser.id,
        text: `${currentUser.username} commented: ${commentText.trim()}`,
      });
    }

    setCommentText('');
    setCommentModalVisible(false);
    loadData();
  };

  const renderPost = ({ item }: { item: Post }) => {
    const postUser = users[item.userId];
    if (!postUser) return null;

    const isLiked = currentUser ? item.likes.includes(currentUser.id) : false;

    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image source={{ uri: postUser.profilePicture }} style={styles.profilePic} />
          <Text style={styles.username}>{postUser.username}</Text>
        </View>

        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />

        <View style={styles.postActions}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={() => handleLike(item)} style={styles.actionButton}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={28}
                color={isLiked ? '#ed4956' : '#000'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedPost(item);
                setCommentModalVisible(true);
              }}
              style={styles.actionButton}
            >
              <Ionicons name="chatbubble-outline" size={26} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="paper-plane-outline" size={26} color="#000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.postInfo}>
          {item.likes.length > 0 && (
            <Text style={styles.likes}>
              {item.likes.length} {item.likes.length === 1 ? 'like' : 'likes'}
            </Text>
          )}
          {item.caption && (
            <Text style={styles.caption}>
              <Text style={styles.captionUsername}>{postUser.username}</Text> {item.caption}
            </Text>
          )}
          {item.comments.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSelectedPost(item);
                setCommentModalVisible(true);
              }}
            >
              <Text style={styles.viewComments}>
                View all {item.comments.length} comments
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.timestamp}>
            {getTimeAgo(new Date(item.createdAt))}
          </Text>
        </View>
      </View>
    );
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>JalilGram</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="heart-outline" size={26} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="paper-plane-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={loadData}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="camera-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Start following people to see their posts</Text>
          </View>
        }
      />

      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCommentModalVisible(false)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Comments</Text>
                <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={selectedPost?.comments || []}
                renderItem={({ item }) => {
                  const commentUser = users[item.userId];
                  return (
                    <View style={styles.commentItem}>
                      <Image
                        source={{ uri: commentUser?.profilePicture }}
                        style={styles.commentProfilePic}
                      />
                      <View style={styles.commentContent}>
                        <Text style={styles.commentText}>
                          <Text style={styles.commentUsername}>{commentUser?.username}</Text>{' '}
                          {item.text}
                        </Text>
                        <Text style={styles.commentTime}>{getTimeAgo(new Date(item.createdAt))}</Text>
                      </View>
                    </View>
                  );
                }}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  <View style={styles.emptyComments}>
                    <Text style={styles.emptyCommentsText}>No comments yet</Text>
                  </View>
                }
              />

              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity onPress={handleComment} disabled={!commentText.trim()}>
                  <Text
                    style={[
                      styles.postButton,
                      !commentText.trim() && styles.postButtonDisabled,
                    ]}
                  >
                    Post
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 20,
  },
  postContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  postImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#f0f0f0',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginRight: 15,
  },
  postInfo: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  likes: {
    fontWeight: '600',
    marginBottom: 4,
  },
  caption: {
    marginTop: 4,
  },
  captionUsername: {
    fontWeight: '600',
  },
  viewComments: {
    color: '#999',
    marginTop: 4,
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentItem: {
    flexDirection: 'row',
    padding: 15,
  },
  commentProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: 14,
  },
  commentUsername: {
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyComments: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCommentsText: {
    color: '#999',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  commentInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    fontSize: 14,
  },
  postButton: {
    color: '#3897f0',
    fontWeight: '600',
    marginLeft: 10,
  },
  postButtonDisabled: {
    color: '#b2dffc',
  },
});
