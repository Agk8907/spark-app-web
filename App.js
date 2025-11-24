import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { PostsProvider } from './src/context/PostsContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <NotificationsProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </NotificationsProvider>
      </PostsProvider>
    </AuthProvider>
  );
}
