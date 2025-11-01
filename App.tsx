import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import dataService from './src/services/dataService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize demo data
      await dataService.initializeDemoData();
      
      // Check if user is logged in
      const user = await dataService.getCurrentUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for auth changes
  useEffect(() => {
    const checkAuth = async () => {
      const user = await dataService.getCurrentUser();
      setIsAuthenticated(!!user);
    };

    // Check auth every second
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3897f0" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
