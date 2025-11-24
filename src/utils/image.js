import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL or blob, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Dynamic IP detection for Expo Go on physical devices
  let baseUrl = 'http://localhost:5000';
  
  if (Platform.OS === 'android') {
    const debuggerHost = Constants.expoConfig?.hostUri;
    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      baseUrl = `http://${ip}:5000`;
    } else {
      baseUrl = 'http://10.0.2.2:5000';
    }
  }

  return `${baseUrl}${imagePath}`;
};
