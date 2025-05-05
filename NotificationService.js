import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permission for notifications
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9439EF',
    });
  }

  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Get the token that uniquely identifies this device
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
    
    // Store the token for later use
    try {
      await AsyncStorage.setItem('@notification_token', token);
    } catch (e) {
      console.error('Error saving notification token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Schedule a local notification
export async function scheduleNotification(title, body, seconds = 5) {
  // Increment badge count
  const currentBadgeCount = await getBadgeCount();
  const newBadgeCount = currentBadgeCount + 1;
  await setBadgeCount(newBadgeCount);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: { data: 'data goes here' },
      badge: newBadgeCount,
    },
    trigger: { seconds: seconds },
  });
}

// Send a notification immediately
export async function sendImmediateNotification(title, body) {
  // Increment badge count
  const currentBadgeCount = await getBadgeCount();
  const newBadgeCount = currentBadgeCount + 1;
  await setBadgeCount(newBadgeCount);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: { data: 'immediate notification' },
      badge: newBadgeCount,
    },
    trigger: null, // null means send immediately
  });
}

// Get all scheduled notifications
export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  // Reset badge count
  await setBadgeCount(0);
}

// Send a recipe recommendation notification
export async function sendRecipeRecommendationNotification() {
  const recipes = [
    {title: 'Pasta', body: 'Check out this delicious pasta recipe!'},
    {title: 'American Burger', body: 'Perfect for a weekend cookout!'},
    {title: 'Baked Salmon', body: 'Healthy and delicious dinner option'},
    {title: 'Greek Salad', body: 'Fresh and light recipe for a hot day'},
  ];
  
  // Pick a random recipe
  const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
  
  await sendImmediateNotification(
    randomRecipe.title, 
    randomRecipe.body
  );
}

// Badge count management
export async function getBadgeCount() {
  try {
    const badgeCount = await AsyncStorage.getItem('@notification_badge_count');
    return badgeCount ? parseInt(badgeCount, 10) : 0;
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
}

export async function setBadgeCount(count) {
  try {
    await AsyncStorage.setItem('@notification_badge_count', count.toString());
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

// Clear badge count
export async function clearBadgeCount() {
  await setBadgeCount(0);
} 