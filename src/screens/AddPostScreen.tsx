import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import dataService from '../services/dataService';
import { User } from '../types';

export default function AddPostScreen({ navigation }: any) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUser();
    requestPermissions();
  }, []);

  const loadUser = async () => {
    const user = await dataService.getCurrentUser();
    setCurrentUser(user);
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setUploading(true);
    try {
      await dataService.createPost({
        userId: currentUser.id,
        imageUrl: selectedImage,
        caption: caption.trim(),
        likes: [],
        comments: [],
        location: undefined,
      });

      Alert.alert('Success', 'Post created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setSelectedImage(null);
            setCaption('');
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity onPress={handlePost} disabled={!selectedImage || uploading}>
          <Text style={[styles.postButton, (!selectedImage || uploading) && styles.postButtonDisabled]}>
            {uploading ? 'Posting...' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.image} />
            <TouchableOpacity 
              style={styles.changeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.selectImageContainer}>
            <Ionicons name="image-outline" size={80} color="#ccc" />
            <Text style={styles.selectImageText}>Select a photo to share</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.selectButton} onPress={pickImage}>
                <Ionicons name="images-outline" size={24} color="#fff" />
                <Text style={styles.selectButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={24} color="#fff" />
                <Text style={styles.selectButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedImage && (
          <View style={styles.captionContainer}>
            <View style={styles.userInfo}>
              <Image 
                source={{ uri: currentUser?.profilePicture }} 
                style={styles.profilePic} 
              />
              <Text style={styles.username}>{currentUser?.username}</Text>
            </View>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={2200}
            />
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
    fontSize: 20,
    fontWeight: '600',
  },
  postButton: {
    color: '#3897f0',
    fontSize: 16,
    fontWeight: '600',
  },
  postButtonDisabled: {
    color: '#b2dffc',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 400,
    backgroundColor: '#f0f0f0',
  },
  changeImageButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
  },
  selectImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  selectImageText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
  },
  selectButton: {
    flexDirection: 'row',
    backgroundColor: '#3897f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  captionContainer: {
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  captionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
