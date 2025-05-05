<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Import Firebase
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Firebase configuration
const firebaseConfig = { 
  apiKey: "AIzaSyCyMwcTDBka9ETtH2TmPegQYlvbuHfVUFU", 
  authDomain: "recipe-recommender-7479c.firebaseapp.com", 
  projectId: "recipe-recommender-7479c", 
  storageBucket: "recipe-recommender-7479c.appspot.com", 
  messagingSenderId: "751925281008", 
  appId: "1:751925281008:web:5bf418314f8fdf72b5c235" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Notification functions
async function registerForPushNotificationsAsync() {
  let token;
  
  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9439EF',
    });
  }

  // Check if device is a physical device and not a simulator/emulator
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // If permission not granted, request it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // If permission still not granted, return
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      alert('Failed to get push notification permission. Please enable notifications in your device settings.');
      return;
    }
    
    // Get the token that uniquely identifies this device
    try {
      // Make sure to specify projectId correctly
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.projectId || 'your-project-id',
      }).then(response => response.data);
      
      console.log('Push token:', token);
    } catch (error) {
      console.log('Error getting push token:', error);
    }
  } else {
    alert('Push notifications require a physical device. They won\'t work on the simulator.');
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Send a notification immediately
async function sendImmediateNotification(title, body) {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
        data: { data: 'immediate notification' },
      },
      trigger: null, // null means send immediately
    });
    
    console.log('Notification scheduled:', identifier);
    return identifier;
  } catch (error) {
    console.error('Error sending notification:', error);
    alert('Failed to send notification: ' + error.message);
  }
}

// Web-compatible alert for platforms that don't support Alert
const showAlert = (title, message, buttons = [{ text: 'OK' }]) => {
  if (Platform.OS === 'web') {
    // Use browser's alert for web
    window.alert(`${title}\n${message}`);
  } else {
    // Use React Native's Alert for mobile
    Alert.alert(title, message, buttons);
  }
};

// ============================
// REUSABLE COMPONENTS
// ============================

const CustomButton = ({ title, onPress, style, textStyle }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const CustomInput = ({ placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default' }) => (
  <TextInput 
    style={styles.input} 
    placeholder={placeholder} 
    value={value} 
    onChangeText={onChangeText} 
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
  />
);

const OptionItem = ({ title, onPress, icon, iconColor = "#8A2BE2", style, textStyle }) => (
  <TouchableOpacity style={[styles.optionItem, style]} onPress={onPress}>
    {icon && <Ionicons name={icon} size={24} color={iconColor} />}
    <Text style={[styles.optionText, textStyle]}>{title}</Text>
    <Ionicons name="chevron-forward" size={24} color="#ccc" />
  </TouchableOpacity>
);

// For debugging purposes
console.log('OptionItem component defined');

// Simple NotificationButton component
const NotificationButton = ({ style }) => {
  const handlePress = async () => {
    // Show options in an alert
    Alert.alert(
      'Notifications',
      'Choose a notification option:',
      [
        {
          text: 'Send Immediate Notification',
          onPress: async () => {
            const id = await sendImmediateNotification(
              'Test Notification', 
              'This is a test notification from Recipe Recommender!'
            );
            if (id) {
              Alert.alert('Success', `Notification sent with ID: ${id}. Check your device's notifications.`);
            }
          }
        },
        {
          text: 'Schedule in 5 Seconds',
          onPress: async () => {
            try {
              const id = await Notifications.scheduleNotificationAsync({
                content: {
                  title: 'Scheduled Notification',
                  body: 'This notification was scheduled to appear 5 seconds after you pressed the button.',
                  sound: true,
                  priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: { seconds: 5 },
              });
              Alert.alert('Success', `Notification scheduled with ID: ${id}. It will appear in 5 seconds.`);
            } catch (error) {
              console.error('Failed to schedule notification:', error);
              Alert.alert('Error', `Failed to schedule notification: ${error.message}`);
            }
          }
        },
        {
          text: 'Check Notification Settings',
          onPress: async () => {
            const settings = await Notifications.getPermissionsAsync();
            Alert.alert(
              'Notification Settings',
              `Status: ${settings.status}\nEnabled: ${settings.granted ? 'Yes' : 'No'}\n` +
              `Please make sure notifications are enabled in your device settings.`
            );
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.notificationButton, style]} 
      onPress={handlePress}
    >
      <Ionicons name="notifications" size={24} color="#fff" />
      <Text style={styles.notificationButtonText}>Notification Options</Text>
    </TouchableOpacity>
  );
};

// ============================
// AUTH CONTEXT
// ============================

const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================
// NOTIFICATION SCREEN
// ============================

const NotificationScreen = ({ navigation }) => {
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [notificationStatus, setNotificationStatus] = useState('unknown');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchScheduledNotifications();
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    try {
      const settings = await Notifications.getPermissionsAsync();
      setNotificationStatus(
        settings.granted 
          ? 'granted' 
          : settings.status === 'denied' 
            ? 'denied' 
            : 'not determined'
      );
      
      // Collect debug information
      const deviceInfo = `Platform: ${Platform.OS} ${Platform.Version}`;
      const expoVersion = Constants.expoConfig ? 
        `Expo SDK: ${Constants.expoConfig.sdkVersion || 'unknown'}` : 
        'Expo Config: Not available';
        
      setDebugInfo(`${deviceInfo}\n${expoVersion}`);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      setDebugInfo(`Error: ${error.message}`);
    }
  };

  const fetchScheduledNotifications = async () => {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledNotifications(notifications);
      console.log('Scheduled notifications:', notifications.length);
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
    }
  };

  const handleClearAllNotifications = async () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await Notifications.cancelAllScheduledNotificationsAsync();
              setScheduledNotifications([]);
              Alert.alert('Success', 'All scheduled notifications have been cleared.');
            } catch (error) {
              console.error('Error clearing notifications:', error);
              Alert.alert('Error', `Failed to clear notifications: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#131010" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Notification Status</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Permission Status:</Text>
          <Text style={[
            styles.statusValue, 
            notificationStatus === 'granted' ? styles.statusGranted : styles.statusDenied
          ]}>
            {notificationStatus === 'granted' ? 'Enabled' : 'Disabled'}
          </Text>
          
          {notificationStatus !== 'granted' && (
            <Text style={styles.statusWarning}>
              Notifications are disabled. Please enable them in your device settings.
            </Text>
          )}
          
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugInfo}>{debugInfo}</Text>
        </View>

        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => {
            sendImmediateNotification('Test Notification', 'This is a test notification!');
            Alert.alert('Success', 'Test notification sent!');
            
            // Refresh the list after a short delay
            setTimeout(() => {
              fetchScheduledNotifications();
            }, 1000);
          }}
        >
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Scheduled Notifications</Text>
          <TouchableOpacity onPress={handleClearAllNotifications}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchScheduledNotifications}
        >
          <Text style={styles.refreshButtonText}>
            <Ionicons name="refresh" size={14} /> Refresh List
          </Text>
        </TouchableOpacity>

        {scheduledNotifications.length === 0 ? (
          <Text style={styles.emptyText}>No scheduled notifications</Text>
        ) : (
          scheduledNotifications.map((notification, index) => (
            <View key={index} style={styles.notificationItem}>
              <View style={styles.notificationIcon}>
                <Ionicons name="notifications" size={24} color="#9439EF" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  {notification.content.title}
                </Text>
                <Text style={styles.notificationBody}>
                  {notification.content.body}
                </Text>
                <Text style={styles.notificationId}>
                  ID: {notification.identifier}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

// ============================
// AUTHENTICATION SCREENS
// ============================

const WelcomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Image 
      source={require('./assets/logo.png')} 
      style={styles.logoImage}
    />
    <Text style={styles.title}>Recipe Recommender</Text>
    <CustomButton 
      title="Login" 
      onPress={() => navigation.navigate('Login')} 
    />
    <CustomButton 
      title="Create Account" 
      onPress={() => navigation.navigate('Register')}
    />
  </View>
);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogin = async () => {
    // Add validation here
    if (email.trim() === '' || password.trim() === '') {
      showAlert('Error', 'Please fill all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      showAlert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <CustomInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <CustomInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry
      />
      <CustomButton 
        title={loading ? "Signing In..." : "Sign In"} 
        onPress={handleLogin}
        style={loading ? styles.disabledButton : styles.button}
        disabled={loading}
      />
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleRegister = async () => {
    // Add validation here
    if (email.trim() === '' || password.trim() === '') {
      showAlert('Error', 'Please fill all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      showAlert('Error', 'Password should be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      showAlert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <CustomInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <CustomInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry
      />
      <CustomInput 
        placeholder="Confirm Password"
        value={confirmPassword} 
        onChangeText={setConfirmPassword} 
        secureTextEntry
      />
      <CustomButton 
        title={loading ? "Creating Account..." : "Register"} 
        onPress={handleRegister}
        style={loading ? styles.disabledButton : styles.button}
        disabled={loading}
      />
    </View>
  );
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSendReset = async () => {
    if (email.trim() === '') {
      showAlert('Error', 'Please enter your email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      showAlert('Success', 'Password reset link sent to your email');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message);
      showAlert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>Reset email sent!</Text> : null}
      <CustomInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <CustomButton 
        title={loading ? "Sending..." : "Send Reset Link"} 
        onPress={handleSendReset}
        style={loading ? styles.disabledButton : styles.button}
        disabled={loading}
      />
    </View>
  );
};

// ============================
// SETTINGS SCREENS
// ============================

const PhoneNumberScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const handleSave = () => {
    if (phoneNumber.trim() === '') {
      showAlert('Error', 'Please enter your phone number');
      return;
    }
    
    showAlert('Success', 'Phone number updated successfully!');
    navigation.goBack();
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Number</Text>
      <CustomInput 
        placeholder="Enter phone number" 
        value={phoneNumber} 
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <CustomButton 
        title="Save" 
        onPress={handleSave}
      />
    </View>
  );
};

const LanguageScreen = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const languages = ['English', 'Arabic', 'French', 'Spanish'];
  
  const handleSave = () => {
    showAlert('Success', `Language changed to ${selectedLanguage}`);
    navigation.goBack();
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      {languages.map((language) => (
        <TouchableOpacity 
          key={language}
          style={[
            styles.optionButton, 
            selectedLanguage === language && styles.selectedOption
          ]}
          onPress={() => setSelectedLanguage(language)}
        >
          <Text style={styles.optionText}>{language}</Text>
          {selectedLanguage === language && (
            <Ionicons name="checkmark" size={24} color="#8A2BE2" style={styles.checkIcon} />
          )}
        </TouchableOpacity>
      ))}
      <CustomButton 
        title="Save" 
        onPress={handleSave}
      />
    </View>
  );
};

const ProfileSettingsScreen = ({ navigation }) => {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    // Get current user email
    if (auth.currentUser) {
      setEmail(auth.currentUser.email);
    }
  }, []);
  
  const handleSave = () => {
    if (name.trim() === '' || email.trim() === '') {
      showAlert('Error', 'Please fill all fields');
      return;
    }
    
    showAlert('Success', 'Profile settings updated successfully!');
    navigation.goBack();
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>
      <CustomInput 
        placeholder="Name" 
        value={name} 
        onChangeText={setName}
      />
      <CustomInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail}
        keyboardType="email-address"
        editable={false} // Email cannot be changed as it's linked to Firebase auth
      />
      <CustomButton 
        title="Save Changes" 
        onPress={handleSave}
      />
    </View>
  ); 
};

// --- Allergy Customization Screen ---
const AllergyCustomizationScreen = ({ navigation }) => {
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  
  const toggleAllergy = (allergyId) => {
    if (selectedAllergies.includes(allergyId)) {
      setSelectedAllergies(selectedAllergies.filter(id => id !== allergyId));
    } else {
      setSelectedAllergies([...selectedAllergies, allergyId]);
    }
  };
  
  const allergies = [
    { id: 1, name: 'Dairy' },
    { id: 2, name: 'Nuts' },
    { id: 3, name: 'Gluten' },
    { id: 4, name: 'Shellfish' },
    { id: 5, name: 'Eggs' },
    { id: 6, name: 'Soy' },
  ];
  
  const handleSave = () => {
    showAlert('Success', 'Allergy preferences saved successfully!');
    navigation.goBack();
  };
  
  return (
    <SafeAreaView style={styles.allergyContainer}>
      <View style={styles.allergyHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8A2BE2" />
        </TouchableOpacity>
        <Text style={styles.allergyTitle}>Allergy Customization</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <Text style={styles.allergyDescription}>Select any allergies or dietary restrictions you have</Text>
      
      <ScrollView style={styles.allergyOptions}>
        {allergies.map(allergy => (
          <TouchableOpacity 
            key={allergy.id} 
            style={styles.allergyItem}
            onPress={() => toggleAllergy(allergy.id)}>
            <Text style={styles.allergyName}>{allergy.name}</Text>
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox, 
                selectedAllergies.includes(allergy.id) && styles.checkboxChecked
              ]}>
                {selectedAllergies.includes(allergy.id) && (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <CustomButton 
        title="Save Preferences" 
        onPress={handleSave}
        style={styles.homeButton}
        textStyle={styles.homeButtonText}
      />
    </SafeAreaView>
  );
};

// ============================
// RECIPE SCREENS
// ============================

const ShareScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState(false);
  const windowWidth = Dimensions.get('window').width;

  const shareRecipe = async () => {
    try {
      await Sharing.shareAsync('Check out this amazing recipe from Recipe Recommender!');
    } catch (error) {
      alert('Sharing failed: ' + error.message);
    }
  };

  const openSocialMedia = (url) => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <SafeAreaView style={styles.shareContainer}>
      {/* App Bar */}
      <View style={styles.shareAppBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.shareAppBarTitle}>Recipe Recommender</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <ScrollView style={styles.shareScrollView}>
        {/* Header */}
        <View style={styles.shareHeaderContainer}>
          <Text style={styles.shareHeaderTitle}>Share to your friends</Text>
          
          {/* Recipe Image */}
          <View style={styles.shareRecipeImageContainer}>
            <Image 
              source={ require('./assets/Recipeimg.jpeg') } 
              style={styles.shareRecipeImage}
            />
          </View>
        </View>

        {/* Expandable Section */}
        <TouchableOpacity 
          style={styles.shareExpandableHeader}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.shareExpandableTitle}>Share recipes with your friends</Text>
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="#9439EF" 
          />
        </TouchableOpacity>
        
        {expanded && (
          <View style={styles.shareExpandableContent}>
            <Text style={styles.shareExpandableText}>
              By protecting and preserving our oceans, we can effectively reduce global warming as healthy oceans absorb a significant amount of atmospheric carbon dioxide. Implementing measures to prevent overfishing, reducing plastic pollution, and conserving marine habitats will contribute to a balanced ocean ecosystem, ultimately mitigating global warming.
            </Text>
          </View>
        )}
        
        {!expanded && (
          <Text style={styles.shareCollapsedText}>
            By clicking on the button you can share the recipe
          </Text>
        )}

        <View style={styles.shareDivider} />

        {/* Social Media Section */}
        <Text style={styles.shareSocialMediaTitle}>Social media</Text>
        
        <View style={styles.shareSocialMediaContainer}>
          {/* Instagram */}
          <TouchableOpacity 
            style={styles.shareSocialButton}
            onPress={() => openSocialMedia('https://instagram.com')}
          >
            <Image 
              source={require('./assets/Instagram.jpeg')}
              style={styles.shareSocialIcon}
            />
            <Text style={styles.shareSocialText}>Instagram</Text>
          </TouchableOpacity>

          {/* TikTok */}
          <TouchableOpacity 
            style={styles.shareSocialButton}
            onPress={() => openSocialMedia('https://tiktok.com')}
          >
            <Image 
              source={require('./assets/Tiktok.jpeg')}
              style={styles.shareSocialIcon}
            />
            <Text style={styles.shareSocialText}>TikTok</Text>
          </TouchableOpacity>

          {/* WhatsApp */}
          <TouchableOpacity 
            style={styles.shareSocialButton}
            onPress={() => openSocialMedia('https://whatsapp.com')}
          >
            <Image 
              source={require('./assets/Whatsapp.jpeg')}
              style={styles.shareSocialIcon}
            />
            <Text style={styles.shareSocialText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.shareButtonContainer}>
        <TouchableOpacity 
          style={[styles.shareButton, styles.shareHomeButton]}
          onPress={() => shareRecipe()}
        >
          <Text style={styles.shareButtonText}>Share Recipe</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainTabs', { screen: 'Recipes' })}>
          <MaterialIcons name="explore" size={28} color="#57636C" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites')}>
          <MaterialIcons name="favorite" size={28} color="#57636C" />
          <Text style={styles.navText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Share')}>
          <Ionicons name="share-social" size={28} color="#57636C" />
          <Text style={styles.navText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const PastaScreen = ({ navigation }) => {
=======
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Recipe Data
const recipes = {
  pasta: {
    title: 'Pasta',
    category: 'Italian Dishes',
    image: require('./assets/pasta.png'),
    ingredients: `2 sprigs of oregano
olive oil 2 small onions and 4 cloves of garlic
1kg rainbow or Swiss chard
½ a lemon

TOMATO SAUCE:
2 cloves of garlic
1 dried red chilli
1 bunch of basil (30g)
3 x 400g tins of quality plum tomatoes
250g dried cannelloni tubes

OOZY CHEESE SAUCE:
250g ricotta cheese
60g Cheddar cheese
60g Parmesan cheese
1 large free-range egg
200ml semi-skimmed milk`,
    directions: `Preheat the oven to 350 degrees F (175 degrees C).
Lightly grease a 9x13-inch baking dish.
Bring a large pot of salted water to a boil.`
  },
  burger: {
    title: 'Classic American Burger',
    category: 'American Dish',
    image: require('./assets/Burger.png'),
    ingredients: `• 500g ground beef
• 1/2 tsp salt
• 1/2 tsp black pepper
• 4 slices cheddar cheese
• 4 burger buns
• Lettuce, tomato, onion
• 4 tbsp mayo`,
    directions: `1. Mix beef with salt and pepper.
2. Shape into patties and cook.
3. Melt cheese on top.
4. Toast buns and assemble burger.`
  },
  bakedSalmon: {
    title: 'Baked Salmon with Asparagus',
    category: 'Diets',
    image: require('./assets/BakedSalmon.png'),
    ingredients: `• 1 salmon fillet
• 1 bunch asparagus, trimmed
• 1 tbsp olive oil
• Lemon slices
• Salt, pepper, and dill for seasoning`,
    directions: `1. Preheat oven to 180°C (350°F).
2. Place the salmon fillet on a baking sheet and drizzle with olive oil.
3. Arrange asparagus around the salmon and season everything.
4. Add lemon slices on top of the salmon and bake for 15-20 minutes.`
  }
};

const exploreRecipes = [
  { id: 1, name: 'Pasta', image: require('./assets/pasta.png'), route: 'Pasta' },
  { id: 2, name: 'Burger', image: require('./assets/Burger.png'), route: 'Burger' },
  { id: 3, name: 'Salad', image: require('./assets/Salad.png'), route: 'Salad' },
  { id: 4, name: 'Greek Salad', image: require('./assets/GreekSalad.png'), route: 'GreekSalad' }
];

// Recipe Screen Component
const RecipeScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const recipe = recipes[recipeId];
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
<<<<<<< HEAD
    <SafeAreaView style={styles.pastaSafeArea}>
      <View style={styles.pastaContainer}>
        {/* App Bar */}
        <View style={styles.pastaAppBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{position: 'absolute', left: 16}}>
            <Ionicons name="arrow-back" size={24} color="#131010" />
          </TouchableOpacity>
          <Text style={styles.pastaAppBarTitle}>Recipe Recommender</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.pastaContent}>
          <View style={styles.pastaSection}>
            <Text style={styles.pastaSectionTitle}>Italian Dishes</Text>
            
            {/* Recipe Image - Adjusted to maintain aspect ratio */}
            <View style={styles.pastaRecipeImageContainer}>
              <Image
                source={require('./assets/Pasta.jpeg')}
                style={styles.pastaRecipeImage}
=======
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.appBarTitle}>Recipe Recommender</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{recipe.category}</Text>
            
            {/* Recipe Image */}
            <View style={styles.recipeImageContainer}>
              <Image
                source={recipe.image}
                style={styles.recipeImage}
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
                resizeMode="cover"
              />
            </View>

            {/* Expandable Recipe Info */}
            <TouchableOpacity 
<<<<<<< HEAD
              style={styles.pastaExpandableHeader}
              onPress={toggleExpand}
            >
              <Text style={styles.pastaRecipeTitle}>Pasta</Text>
              <Ionicons 
=======
              style={styles.expandableHeader}
              onPress={toggleExpand}
            >
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Ionicons
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
                name={expanded ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#9439EF" 
              />
            </TouchableOpacity>

            {!expanded ? (
<<<<<<< HEAD
              <Text style={styles.pastaCollapsedContent}>
                Ingredients:{"\n"}
                2 sprigs of oregano{"\n"}
                olive oil 2 small onions and 4 cloves of garlic{"\n"}
                1kg rainbow or Swiss chard, or other seasonal greens{"\n"}
                ½ a lemon{"\n\n"}
                TOMATO SAUCE:{"\n"}
                2 cloves of garlic{"\n"}
                1 dried red chilli{"\n"}
                1 bunch of basil (30g){"\n"}
                3 x 400g tins of quality plum tomatoes{"\n"}
                250g dried cannelloni tubes{"\n\n"}
                OOZY CHEESE SAUCE:{"\n"}
                250g ricotta cheese{"\n"}
                60g Cheddar cheese{"\n"}
                60g Parmesan cheese{"\n"}
                1 large free-range egg{"\n"}
                200ml semi-skimmed milk{"\n\n"}
                Directions:{"\n"}
                Preheat the oven to 350 degrees F (175 degrees C).{"\n"}
                Lightly grease a 9x13-inch baking dish.{"\n"}
                Bring a large pot of salted water to a boil.
              </Text>
            ) : (
              <View 
                style={styles.pastaExpandedContent}
              >
                <Text style={styles.pastaRecipeDescription}>
                  By protecting and preserving our oceans, we can effectively reduce global warming as healthy oceans absorb a significant amount of atmospheric carbon dioxide. Implementing measures to prevent overfishing, reducing plastic pollution, and conserving marine habitats will contribute to a balanced ocean ecosystem, ultimately mitigating global warming.
                </Text>
              </View>
            )}

            {/* More Recipes Section */}
            <Text style={styles.pastaExploreTitle}>Explore more!</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.pastaRecipesScroll}
            >
              <TouchableOpacity 
                style={styles.pastaRecipeThumbnail}
                onPress={() => navigation.navigate('Pasta')}
              >
                <Image
                  source={require('./assets/Pasta.jpeg')}
                  style={styles.pastaThumbnailImage}
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.pastaRecipeThumbnail}
                onPress={() => navigation.navigate('Burgar')}
              >
                <Image
                  source={require('./assets/Burgers.jpeg')}
                  style={styles.pastaThumbnailImage}
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.pastaRecipeThumbnail}
                onPress={() => navigation.navigate('Greeksald')}
              >
                <Image
                  source={require('./assets/Salads.jpeg')}
                  style={styles.pastaThumbnailImage}
                />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.pastaBottomNav}>
          <TouchableOpacity 
            style={styles.pastaNavButton}
            onPress={() => navigation.navigate('Recipes')}
          >
            <Ionicons name="compass-outline" size={28} color="#57636C" />
            <Text style={styles.pastaNavButtonText}>Explore</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pastaNavButton}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Ionicons name="heart" size={28} color="#9439EF" />
            <Text style={[styles.pastaNavButtonText, { color: '#9439EF' }]}>Favorites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pastaNavButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={28} color="#57636C" />
            <Text style={styles.pastaNavButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
=======
              <Text style={styles.collapsedContent}>
                Ingredients:{"\n"}{recipe.ingredients}
                {"\n\n"}Directions:{"\n"}{recipe.directions}
              </Text>
            ) : (
              <Animatable.View 
                animation="fadeIn"
                duration={300}
                style={styles.expandedContent}
              >
                <Text style={styles.recipeDescription}>
                  By protecting and preserving our oceans, we can effectively reduce global warming as healthy oceans absorb a significant amount of atmospheric carbon dioxide. Implementing measures to prevent overfishing, reducing plastic pollution, and conserving marine habitats will contribute to a balanced ocean ecosystem, ultimately mitigating global warming.
                </Text>
              </Animatable.View>
            )}

            {/* More Recipes Section */}
            <Text style={styles.exploreTitle}>Explore more!</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.recipesScroll}
            >
              {exploreRecipes.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.recipeThumbnail}
                  onPress={() => navigation.navigate(item.route)}
                >
                  <Image
                    source={item.image}
                    style={styles.thumbnailImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
      </View>
    </SafeAreaView>
  );
};

<<<<<<< HEAD
const Dessert = ({ navigation }) => {
  return (
    <ScrollView style={styles.dessertContainer}>
      <View style={styles.dessertHeaderFlex}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#131010" />
        </TouchableOpacity>
        <Text style={styles.dessertHeaderTitle}>Recipe Recommender</Text>
        <View style={{ width: 24 }} />
      </View>
    
      <Text style={styles.dessertHeading}>Dessert Course</Text>

      <Image
        source={require('./assets/Dessert.jpeg')}
        style={styles.dessertMainImage}
      />

      <Text style={styles.dessertTitle}>Perfect French Macarons</Text>

      <Text style={styles.dessertDescription}>
        Master the art of baking amazing macaron cookies consistently, and create stunning macaron towers and plated desserts.
        {'\n\n'}Cake Nuvo - Online Baking School, Irit Ishal{'\n'}4.8 ★★★★★ (1554){'\n'}3.5 total hours | 33 lectures | All levels
      </Text>

      <Text style={styles.dessertPrice}>$69.99</Text>

      <TouchableOpacity style={styles.dessertButton} onPress={() => alert('Course Started!')}>
        <Text style={styles.dessertButtonText}>Start</Text>
      </TouchableOpacity>

      <Text style={styles.dessertExplore}>Explore more!</Text>

      <View style={styles.dessertImageRow}>
        <Image
          source={require('./assets/Jelly.jpg')}
          style={styles.dessertThumbnail}
        />
        <Image
          source={require('./assets/Panna.jpeg')}
          style={styles.dessertThumbnail}
        />
        <Image
          source={require('./assets/desserts.png')}
          style={styles.dessertThumbnail}
        />
      </View>

      <TouchableOpacity
        style={styles.dessertHomeButton}
        onPress={() => navigation.navigate('MainTabs')}>
        <Text style={styles.dessertHomeButtonText}>Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const AmericanBurger = ({ navigation }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.burgerContainer}>
        <View style={styles.burgerHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#131010" />
          </TouchableOpacity>
          <Text style={styles.burgerHeaderTitle}>Recipe Recommender</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subHeader}>American Dish</Text>

        <Image
          source={require('./assets/Burgers.jpeg')}
          style={styles.burgerImage}
        />

        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.burgerTitle}>Classic American Burger</Text>
        </TouchableOpacity>

        {expanded && (
          <Text style={styles.burgerDescription}>
            By protecting and preserving our oceans, we can effectively reduce global warming as healthy oceans absorb a significant amount of atmospheric carbon dioxide. Implementing measures to prevent overfishing, reducing plastic pollution, and conserving marine habitats will contribute to a balanced ocean ecosystem, ultimately mitigating global warming.
          </Text>
        )}

        <Text style={styles.burgerBody}>
          Ingredients:
          {'\n'}• 500g ground beef
          {'\n'}• 1/2 tsp salt
          {'\n'}• 1/2 tsp black pepper
          {'\n'}• 4 slices cheddar cheese
          {'\n'}• 4 burger buns
          {'\n'}• Lettuce, tomato, onion
          {'\n'}• 4 tbsp mayo

          {'\n\n'}Instructions:
          {'\n'}1. Mix beef with salt and pepper.
          {'\n'}2. Shape into patties and cook.
          {'\n'}3. Melt cheese on top.
          {'\n'}4. Toast buns and assemble burger.
        </Text>

        <Text style={styles.burgerExplore}>Explore more!</Text>

        <ScrollView horizontal contentContainerStyle={styles.burgerThumbRow}>
          <Image style={styles.burgerThumb} source={require('./assets/Pasta.jpeg')} />
          <Image style={styles.burgerThumb} source={require('./assets/Salads.jpeg')} />
          <Image style={styles.burgerThumb} source={require('./assets/Pasta.jpeg')} />
        </ScrollView>
      </ScrollView>

      <View style={styles.burgerNavBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
          <Ionicons name="earth-outline" size={24} color="#57636C" />
          <Text style={styles.burgerNavText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
          <Ionicons name="heart-outline" size={24} color="#57636C" />
          <Text style={styles.burgerNavText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="#57636C" />
          <Text style={styles.burgerNavText}>Settings</Text>
        </TouchableOpacity>
      </View>
=======
// Diets Screen Component
const DietsScreen = ({ navigation }) => {
  const dietItems = [
    { id: 1, title: 'Broiled Salmon', image: require('./assets/Salmon.png'), route: 'BroiledSalmon' },
    { id: 2, title: 'Greek Salad', image: require('./assets/GreekSalad.png'), route: 'GreekSalad' },
    { id: 3, title: 'Chia Pudding', image: require('./assets/Chia.png'), route: 'ChiaPudding' },
    { id: 4, title: 'Eggs in Purgatory', image: require('./assets/Eggs.png'), route: 'EggsInPurgatory' },
    { id: 5, title: 'Baked Salmon with Asparagus', image: require('./assets/BakedSalmon.png'), route: 'BakedSalmon' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Diets</Text>
        <View style={styles.appBarActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="home" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Diet Items List */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.listContainer}>
          {dietItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.dietItem}
              onPress={() => navigation.navigate(item.route)}
            >
              <Image source={item.image} style={styles.dietImage} />
              <View style={styles.dietInfo}>
                <Text style={styles.dietTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#57636C" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
    </SafeAreaView>
  );
};

<<<<<<< HEAD
const Favorites = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const windowWidth = Dimensions.get('window').width;

  const favoriteDishes = [
    {
      id: 1,
      name: 'Pasta',
      rating: 4.6,
      description: 'Creamy pasta',
      image: require('./assets/Pasta.jpeg'),
      route: 'Pasta'  // Links to PastaScreen
    },
    {
      id: 2,
      name: 'Beef Burger',
      rating: 4.7,
      description: 'Juicy beef patty with toppings',
      image: require('./assets/Burgers.jpeg'),
      route: 'AmericanBurger'  // Changed from 'Burgar' to 'AmericanBurger'
    },
    {
      id: 3,
      name: 'Seasonal Spinach Salad',
      rating: 4.5,
      description: 'Crisp romaine with Caesar dressing',
      image: require('./assets/Salads.jpeg'),
      route: 'Greeksald'  // Links to Greek Salad screen
    },
    {
      id: 4,
      name: 'Margherita Pizza',
      rating: 4.9,
      description: 'Classic Italian pizza',
      image: { uri: 'https://images.unsplash.com/photo-1602658015584-790c9302078f?w=500&h=500' },
      route: 'Pizza'  // Links to Pizza screen
    }
=======
// Favorites Screen Component
const FavoritesScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  
  const favoriteDishes = [
    { id: 1, name: 'Pasta', rating: 4.6, description: 'Creamy pasta', image: require('./assets/pasta.png') },
    { id: 2, name: 'Beef Burger', rating: 4.7, description: 'Juicy beef patty with toppings', image: require('./assets/Burger.png') },
    { id: 3, name: 'Seasonal Spinach Salad', rating: 4.5, description: 'Crisp romaine with Caesar dressing', image: require('./assets/Salad.png') },
    { id: 4, name: 'Margherita Pizza', rating: 4.9, description: 'Classic Italian pizza', image: require('./assets/Pizza.png') }
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
  ];

  const filteredDishes = favoriteDishes.filter(dish =>
    dish.name.toLowerCase().includes(searchText.toLowerCase()) ||
    dish.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
<<<<<<< HEAD
    <View style={styles.favContainer}>
      {/* Header */}
      <View style={[styles.favHeader, { width: windowWidth }]}>
        <Text style={styles.favHeaderTitle}>Favorite Dishes</Text>
        <Text style={styles.favHeaderSubtitle}>Your culinary treasures in one place</Text>
=======
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorite Dishes</Text>
        <Text style={styles.headerSubtitle}>Your culinary treasures in one place</Text>
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9E9E9E" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your favorites..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#101213"
          />
        </View>
      </View>

      {/* Favorites List */}
      <ScrollView style={styles.listContainer}>
        {filteredDishes.map(dish => (
          <TouchableOpacity 
            key={dish.id} 
            style={styles.dishCard}
<<<<<<< HEAD
            onPress={() => navigation.navigate(dish.route)}
=======
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
          >
            <Image source={dish.image} style={styles.dishImage} />
            <View style={styles.dishInfo}>
              <Text style={styles.dishName}>{dish.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFC107" />
                <Text style={styles.ratingText}>{dish.rating}</Text>
              </View>
              <Text style={styles.dishDescription}>{dish.description}</Text>
            </View>
<<<<<<< HEAD
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => navigation.navigate(dish.route)}
            >
=======
            <TouchableOpacity style={styles.favoriteButton}>
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
              <Ionicons name="heart" size={24} color="#FF0000" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
<<<<<<< HEAD

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainTabs', { screen: 'Recipes' })}>
          <MaterialIcons name="explore" size={28} color="#57636C" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites')}>
          <MaterialIcons name="favorite" size={28} color="#57636C" />
          <Text style={styles.navText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Share')}>
          <Ionicons name="share-social" size={28} color="#57636C" />
          <Text style={styles.navText}>Share</Text>
        </TouchableOpacity>
      </View>
=======
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
    </View>
  );
};

<<<<<<< HEAD
const Cuisine = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const windowWidth = Dimensions.get('window').width;

  const cuisines = [
    {
      id: 1,
      name: 'American',
      rating: 4.7,
      description: 'Traditional American cuisine',
      image: 'https://images.unsplash.com/photo-1695924428716-0b09d79add5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxfHxBbWVyaWNhbiUyMGZvb2R8ZW58MHx8fHwxNzMxODkwOTkzfDA&ixlib=rb-4.0.3&q=80&w=1080',
      route: 'AmericanBurger',
    },
    {
      id: 2,
      name: 'Italian',
      rating: 4.9,
      description: 'Pasta, pizza and more',
      image: 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHw2fHxJdGFsaWFuJTIwfGVufDB8fHx8MTczMTg5MTAyMnww&ixlib=rb-4.0.3&q=80&w=1080',
      route: 'Pasta',
    },
    {
      id: 3,
      name: 'Indian',
      rating: 4.6,
      description: 'Flavorful spices and curries',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiN5j5yF2Hk5rKpXwJMCdJ1VTErvrVB9ZjUw&s',
      route: 'ChickenTikka',
    },
    {
      id: 4,
      name: 'Saudi',
      rating: 4.5,
      description: 'Middle Eastern delights',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2pitQlQZiHqssa5P9dP76EBqbOHbG4i8BGw&s',
      route: 'Kabsa',
    },
    {
      id: 5,
      name: 'Mexican',
      rating: 4.8,
      description: 'Spicy and flavorful dishes',
      image: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxfHxNZXhpY2FuJTIwZm9vZCUyMHxlbnwwfHx8fDE3MzE4OTExMzV8MA&ixlib=rb-4.0.3&q=80&w=1080',
      route: 'Fijita',
    },
  ];

  const filteredCuisines = cuisines.filter(cuisine =>
    cuisine.name.toLowerCase().includes(searchText.toLowerCase()) ||
    cuisine.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.favContainer}>
      {/* Header */}
      <View style={[styles.favHeader, { width: windowWidth }]}>
        <Text style={styles.favHeaderTitle}>Cuisines</Text>
        <Text style={styles.favHeaderSubtitle}>Explore delicious cuisines from around the world</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9E9E9E" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cuisines..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#101213"
          />
        </View>
      </View>

      {/* Cuisines List */}
      <ScrollView style={styles.listContainer}>
        {filteredCuisines.map(cuisine => (
          <TouchableOpacity 
            key={cuisine.id} 
            style={styles.dishCard}
            onPress={() => navigation.navigate(cuisine.route)}
          >
            <Image source={{ uri: cuisine.image }} style={styles.dishImage} />
            <View style={styles.dishInfo}>
              <Text style={styles.dishName}>{cuisine.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFC107" />
                <Text style={styles.ratingText}>{cuisine.rating}</Text>
              </View>
              <Text style={styles.dishDescription}>{cuisine.description}</Text>
            </View>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="chevron-forward" size={24} color="#9439EF" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainTabs', { screen: 'Recipes' })}>
          <MaterialIcons name="explore" size={28} color="#57636C" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites')}>
          <MaterialIcons name="favorite" size={28} color="#57636C" />
          <Text style={styles.navText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Share')}>
          <Ionicons name="share-social" size={28} color="#57636C" />
          <Text style={styles.navText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BakedSalmonwithAsparagus = ({ navigation }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
=======
// Share Screen Component
const ShareScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState(false);

  const shareRecipe = async () => {
    try {
      await Sharing.shareAsync('Check out this amazing recipe from Recipe Recommender!');
    } catch (error) {
      alert('Sharing failed: ' + error.message);
    }
  };

  const openSocialMedia = (url) => {
    WebBrowser.openBrowserAsync(url);
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
  };

  return (
    <SafeAreaView style={styles.container}>
<<<<<<< HEAD
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#131010" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recipe Recommender</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.dietsTitle}>Diets</Text>
          
          <View style={styles.imageContainer}>
            <Image
              source={require('./assets/Salmon.jpeg')}
              style={styles.recipeImage}
            />
          </View>

          <TouchableOpacity onPress={toggleExpand} style={styles.expandableHeader}>
            <Text style={styles.recipeTitle}>Baked Salmon with Asparagus</Text>
          </TouchableOpacity>

          {expanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.description}>
                By protecting and preserving our oceans, we can effectively reduce global warming as healthy oceans absorb a significant amount of atmospheric carbon dioxide. Implementing measures to prevent overfishing, reducing plastic pollution, and conserving marine habitats will contribute to a balanced ocean ecosystem, ultimately mitigating global warming.
              </Text>
            </View>
          )}

          <Text style={styles.ingredientsTitle}>Ingredients:</Text>
          <Text style={styles.ingredientsText}>
            • 1 salmon fillet{"\n"}
            • 1 bunch asparagus, trimmed{"\n"}
            • 1 tbsp olive oil{"\n"}
            • Lemon slices{"\n"}
            • Salt, pepper, and dill for seasoning{"\n\n"}
            Instructions:{"\n\n"}
            1. Preheat oven to 180°C (350°F).{"\n"}
            2. Place the salmon fillet on a baking sheet and drizzle with olive oil.{"\n"}
            3. Arrange asparagus around the salmon and season everything with salt, pepper, and dill.{"\n"}
            4. Add lemon slices on top of the salmon and bake for 15-20 minutes until the fish is cooked through.{"\n\n"}
            These meals are low in calories, high in nutrients, and perfect for a healthy diet!
          </Text>

          <Text style={styles.exploreTitle}>Explore more!</Text>

          <View style={styles.thumbnailsRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Pasta')}>
              <Image
                source={require('./assets/Pasta.jpeg')}
                style={styles.thumbnail}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Burgar')}>
              <Image
                source={require('./assets/Burgers.jpeg')}
                style={styles.thumbnail}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Greeksald')}>
              <Image
                source={require('./assets/Salads.jpeg')}
                style={styles.thumbnail}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainTabs', { screen: 'Recipes' })}>
          <MaterialIcons name="explore" size={28} color="#57636C" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites')}>
          <MaterialIcons name="favorite" size={28} color="#57636C" />
          <Text style={styles.navText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Share')}>
          <Ionicons name="share-social" size={28} color="#57636C" />
          <Text style={styles.navText}>Share</Text>
=======
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Recipe Recommender</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Share to your friends</Text>
          
          {/* Recipe Image */}
          <View style={styles.recipeImageContainer}>
            <Image 
              source={require('./assets/fru.png')}
              style={styles.recipeImage}
            />
          </View>
        </View>

        {/* Expandable Section */}
        <TouchableOpacity 
          style={styles.expandableHeader}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandableTitle}>Share recipes with your friends</Text>
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="#9439EF" 
          />
        </TouchableOpacity>
        
        {expanded && (
          <View style={styles.expandableContent}>
            <Text style={styles.expandableText}>
              By protecting and preserving our oceans, we can effectively reduce global warming as healthy oceans absorb a significant amount of atmospheric carbon dioxide. Implementing measures to prevent overfishing, reducing plastic pollution, and conserving marine habitats will contribute to a balanced ocean ecosystem, ultimately mitigating global warming.
            </Text>
          </View>
        )}
        
        {!expanded && (
          <Text style={styles.collapsedText}>
            By clicking on the button you can share the recipe
          </Text>
        )}

        <View style={styles.divider} />

        {/* Social Media Section */}
        <Text style={styles.socialMediaTitle}>Social media</Text>
        
        <View style={styles.socialMediaContainer}>
          {/* Instagram */}
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => openSocialMedia('https://instagram.com')}
          >
            <Image 
              source={require('./assets/insta.png')}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>Instagram</Text>
          </TouchableOpacity>

          {/* TikTok */}
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => openSocialMedia('https://tiktok.com')}
          >
            <Image 
              source={require('./assets/Tik.png')}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>TikTok</Text>
          </TouchableOpacity>

          {/* WhatsApp */}
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => openSocialMedia('https://whatsapp.com')}
          >
            <Image 
              source={require('./assets/Whats.png')}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.homeButton]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.nextButton]}
          onPress={shareRecipe}
        >
          <Text style={styles.buttonText}>Share</Text>
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

<<<<<<< HEAD
// ============================
// MAIN TAB SCREENS
// ============================

const SettingsScreen = ({ navigation }) => {
  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        try {
          await signOut(auth);
          navigation.navigate('Welcome');
        } catch (error) {
          console.error('Logout error:', error);
          showAlert('Error', 'Failed to log out. Please try again.');
        }
      }
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: async () => {
              try {
                await signOut(auth);
                navigation.navigate('Welcome');
              } catch (error) {
                console.error('Logout error:', error);
                showAlert('Error', 'Failed to log out. Please try again.');
              }
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.settingsContainer}>
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.settingsScrollView}>
        <OptionItem 
          title="Allergies" 
          onPress={() => navigation.navigate('Allergies')}
          icon="alert-circle-outline"
        />
        
        <OptionItem 
          title="Phone Number" 
          onPress={() => navigation.navigate('PhoneNumber')}
          icon="call-outline"
        />
        
        <OptionItem 
          title="Language" 
          onPress={() => navigation.navigate('Language')}
          icon="language-outline"
        />
        
        <OptionItem 
          title="Profile Settings" 
          onPress={() => navigation.navigate('ProfileSettings')}
          icon="person-outline"
        />
        
        <OptionItem 
          title="Log out" 
          onPress={handleLogout}
          icon="log-out-outline"
          iconColor="#ff4d4d"
          style={{ backgroundColor: '#ffecec' }}
          textStyle={{ color: '#ff4d4d' }}
        />
=======
// ExploreScreen Component
const ExploreScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Explore Recipes</Text>
        
        <TouchableOpacity 
          style={styles.categoryCard}
          onPress={() => navigation.navigate('Pasta')}
        >
          <Image source={require('./assets/pasta.png')} style={styles.categoryImage} />
          <Text style={styles.categoryTitle}>Italian</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.categoryCard}
          onPress={() => navigation.navigate('Burger')}
        >
          <Image source={require('./assets/Burger.png')} style={styles.categoryImage} />
          <Text style={styles.categoryTitle}>American</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.categoryCard}
          onPress={() => navigation.navigate('Diets')}
        >
          <Image source={require('./assets/Salmon.png')} style={styles.categoryImage} />
          <Text style={styles.categoryTitle}>Healthy</Text>
        </TouchableOpacity>
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
      </ScrollView>
    </SafeAreaView>
  );
};

<<<<<<< HEAD
const RecipeCategoriesScreen = ({ navigation }) => {
  const categories = [
    { id: 1, name: 'Cuisine', image: require('./assets/cuisine.png') },
    { id: 2, name: 'Dishes', image: require('./assets/dishes.png') },
    { id: 3, name: 'Diet', image: require('./assets/diet.png') },
  ];

  // Update to handle navigation to Cuisine screen from Cuisine category
  const handleCategoryPress = (category) => {
    if (category.name === 'Diet') {
      navigation.navigate('BakedSalmonwithAsparagus');
    } else if (category.name === 'Cuisine') {
      navigation.navigate('Cuisine');
    } else {
      navigation.navigate('CategoryDetails', { category: category.name });
    }
  };

  return (
    <View style={styles.containerPadded}>
      <Text style={styles.title}>Recipes</Text>
      
      {/* Add notification button */}
      <NotificationButton />
      
      {categories.map((category) => (
        <TouchableOpacity 
          key={category.id} 
          style={styles.categoryButton}
          onPress={() => handleCategoryPress(category)}
        >
          <Image source={category.image} style={styles.categoryImage} />
          <Text style={styles.categoryText}>{category.name}</Text>
          <Ionicons name="chevron-forward" size={24} color="#8A2BE2" style={styles.categoryIcon} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const CoursesScreen = ({ navigation }) => {
  const courses = [
    { id: 1, name: 'Bread', image: require('./assets/bread.png') },
    { id: 2, name: 'Dessert', image: require('./assets/desserts.png') },
    { id: 3, name: 'Appetizers', image: require('./assets/Appetizers.png') },
    { id: 4, name: 'Soup', image: require('./assets/soups.png') },
  ];

  // Update to handle direct navigation to Dessert page
  const handleCoursePress = (course) => {
    if (course.name === 'Dessert') {
      navigation.navigate('Dessert');
    } else {
      navigation.navigate('CourseDetails', { course: course.name });
    }
  };

  return (
    <ScrollView>
      <View style={styles.containerPadded}>
        <Text style={styles.title}>Learn</Text>
        
        {courses.map(course => (
          <TouchableOpacity 
            key={course.id} 
            style={styles.courseButton}
            onPress={() => handleCoursePress(course)}
          > 
            <Image 
              source={course.image} 
              style={styles.courseImage} 
            />
            <Text style={styles.courseText}>{course.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const OrderNowScreen = () => {
  const stores = [
    { id: 1, name: 'Carrefour', url: 'https://www.carrefourksa.com/', image: require('./assets/carrefour.png') },
    { id: 2, name: 'Danube', url: 'https://www.danube.sa/', image: require('./assets/danube.png') },
    { id: 3, name: 'Tamimi Markets', url: 'https://www.tamimimarkets.com/', image: require('./assets/tamimi.png') },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Now</Text>
      
      {stores.map(store => (
        <TouchableOpacity
          key={store.id}
          style={styles.storeButton}
          onPress={() => Linking.openURL(store.url)}>
          <Image source={store.image} style={styles.storeImage} />
          <Text style={styles.storeButtonText}>{store.name}</Text>
        </TouchableOpacity>
      ))}
=======
// Settings Screen Component
const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Settings Screen</Text>
      <Text style={styles.headerSubtitle}>App preferences and settings</Text>
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
    </View>
  );
};

<<<<<<< HEAD
// ============================
// NAVIGATION SETUP
// ============================

const MainTabsScreen = () => (
  <Tab.Navigator screenOptions={({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;
      
      if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
      else if (route.name === 'Recipes') iconName = focused ? 'book' : 'book-outline';
      else if (route.name === 'Learn') iconName = focused ? 'school' : 'school-outline';
      else if (route.name === 'Order') iconName = focused ? 'cart' : 'cart-outline';
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#8A2BE2',
    tabBarInactiveTintColor: '#888',
    headerShown: false,
  })}>
    <Tab.Screen name="Recipes" component={RecipeCategoriesScreen} />
    <Tab.Screen name="Learn" component={CoursesScreen} />
    <Tab.Screen name="Order" component={OrderNowScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// ============================
// APP ROOT
// ============================

// Auth State Component
const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification data:', data);
      // You can handle navigation based on notification here
    });

    // Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Check if this is a login event (user was null, now it's not)
      const isLogin = !user && currentUser;
      
      setUser(currentUser);
      if (initializing) setInitializing(false);
      
      // Send welcome notification when a user logs in
      if (isLogin) {
        sendImmediateNotification(
          'Welcome to Recipe Recommender!', 
          'Find and share delicious recipes with your friends.'
        );
      }
    });

    // Schedule a "We missed you" notification after 1 minute of opening the app
    // Note: This is set to 1 minute for testing purposes. In production, you would use a longer duration.
    try {
      const scheduleMissYouNotification = async () => {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'We miss you!',
            body: 'Come back and discover some delicious new recipes!',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: { seconds: 60 }, // 1 minute for testing purposes
        });
        console.log('TESTING: "We miss you" notification scheduled for 1 minute - in production this would be hours or days');
      };
      
      scheduleMissYouNotification();
    } catch (error) {
      console.error('Error scheduling miss you notification:', error);
    }

    // Clean up the listeners
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      unsubscribe();
    };
  }, [user, initializing]);

  if (initializing) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: true,
          headerStyle: {
            backgroundColor: '#9439ef',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
        initialRouteName={user ? "MainTabs" : "Welcome"}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="MainTabs" component={MainTabsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Allergies" component={AllergyCustomizationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
        {/* Recipe screens */}
        <Stack.Screen name="BakedSalmonwithAsparagus" component={BakedSalmonwithAsparagus} options={{ headerShown: false }} />
        <Stack.Screen name="Cuisine" component={Cuisine} options={{ headerShown: false }} />
        <Stack.Screen name="AmericanBurger" component={AmericanBurger} options={{ headerShown: false }} />
        <Stack.Screen name="Favorites" component={Favorites} options={{ headerShown: false }} />
        <Stack.Screen name="Share" component={ShareScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dessert" component={Dessert} options={{ headerShown: false }} />
        <Stack.Screen name="Pasta" component={PastaScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Burgar" component={PlaceholderScreen} options={{ title: 'Burger Recipe' }} />
        <Stack.Screen name="Greeksald" component={PlaceholderScreen} options={{ title: 'Greek Salad Recipe' }} />
        <Stack.Screen name="ChickenTikka" component={PlaceholderScreen} options={{ title: 'Chicken Tikka Recipe' }} />
        <Stack.Screen name="Kabsa" component={PlaceholderScreen} options={{ title: 'Kabsa Recipe' }} />
        <Stack.Screen name="Fijita" component={PlaceholderScreen} options={{ title: 'Fajita Recipe' }} />
        <Stack.Screen name="Pizza" component={PlaceholderScreen} options={{ title: 'Pizza Recipe' }} />
        <Stack.Screen name="Search" component={PlaceholderScreen} options={{ title: 'Search Recipes' }} />
        {/* Add placeholder screens for actual content */}
        <Stack.Screen 
          name="CategoryDetails" 
          component={PlaceholderScreen} 
          options={({ route }) => ({ title: route.params.category })}
        />
        <Stack.Screen 
          name="CourseDetails" 
          component={PlaceholderScreen} 
          options={({ route }) => ({ title: route.params.course })}
        />
      </Stack.Navigator>
=======
// Navigation Stacks
const ExploreStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen name="Pasta" component={RecipeScreen} initialParams={{ recipeId: 'pasta' }} />
      <Stack.Screen name="Burger" component={RecipeScreen} initialParams={{ recipeId: 'burger' }} />
      <Stack.Screen name="BakedSalmon" component={RecipeScreen} initialParams={{ recipeId: 'bakedSalmon' }} />
      <Stack.Screen name="Diets" component={DietsScreen} />
      <Stack.Screen name="Share" component={ShareScreen} />
    </Stack.Navigator>
  );
};

// Main App Component
const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Explore') {
              iconName = focused ? 'compass' : 'compass-outline';
            } else if (route.name === 'Favorites') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#9439EF',
          tabBarInactiveTintColor: '#57636C',
          tabBarStyle: styles.bottomNav,
          tabBarLabelStyle: styles.navText
        })}
      >
        <Tab.Screen name="Explore" component={ExploreStack} options={{ headerShown: false }} />
        <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
    </NavigationContainer>
  );
};

<<<<<<< HEAD
// Placeholder for category and course detail screens
const PlaceholderScreen = ({ route }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{route.params?.category || route.params?.course}</Text>
    <Text style={styles.subtitle}>Content coming soon</Text>
  </View>
);

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

// ============================
// STYLES
// ============================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  containerPadded: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#343a40'
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 20
  },
  input: {
    width: '100%',
    borderColor: '#ced4da',
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  button: {
    width: '100%',
    backgroundColor: '#9439ef',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  disabledButton: {
    width: '100%',
    backgroundColor: '#d8b9f7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  logoImage: {
    width: 300,
    height: 200,
    marginBottom: 20,
    borderRadius: 20,
    resizeMode: 'cover'
  },
  storeButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderColor: '#dee2e6',
    borderWidth: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
  },
  storeImage: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 20
  },
  storeButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  link: {
    color: '#007bff',
    marginTop: 15
  },
  optionButton: {
    width: '100%',
    backgroundColor: '#f1f1f1',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selectedOption: {
    backgroundColor: '#e6d4ff',
    borderColor: '#8A2BE2',
    borderWidth: 1
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  checkIcon: {
    marginLeft: 10
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16
  },
  successText: {
    color: '#28a745',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16
  },
  // Allergy styles
  allergyContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20
  },
  allergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  allergyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40'
  },
  allergyDescription: {
    fontSize: 16,
    color: '#343a40',
    marginBottom: 15
  },
  allergyOptions: {
    marginBottom: 20
  },
  allergyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    justifyContent: 'space-between'
  },
  allergyName: {
    fontSize: 18,
    color: '#343a40'
  },
  checkboxContainer: {
    marginLeft: 'auto'
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#8A2BE2',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: '#8A2BE2'
  },
  homeButton: {
    width: '100%',
    backgroundColor: '#9439ef',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  // Course styles
  courseButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderColor: '#dee2e6',
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseText: {
    fontSize: 20,
    color: '#343a40',
    fontWeight: 'bold',
    marginLeft: 15
  },
  courseImage: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  // Recipe category styles
  categoryButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderColor: '#dee2e6',
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  categoryText: {
    fontSize: 20,
    color: '#343a40',
    fontWeight: 'bold',
    flex: 1,
  },
  categoryIcon: {
    marginLeft: 'auto',
  },
  // Styles for BakedSalmonwithAsparagus
  header: {
=======
// Complete Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appBar: {
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
<<<<<<< HEAD
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#9439EF',
    fontFamily: 'InterTight',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
  },
  content: {
    paddingTop: 70,
    paddingHorizontal: 16,
  },
  dietsTitle: {
    fontSize: 24,
    color: '#9439EF',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: 230,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
=======
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  appBarActions: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    color: '#9439EF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  recipeImageContainer: {
    width: '100%',
    height: 270,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
    marginBottom: 16,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
<<<<<<< HEAD
    resizeMode: 'cover',
  },
  expandableHeader: {
=======
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
    paddingVertical: 8,
  },
  recipeTitle: {
    fontSize: 20,
    color: '#9439EF',
<<<<<<< HEAD
    fontWeight: 'bold',
    textAlign: 'center',
=======
    fontWeight: '600',
  },
  collapsedContent: {
    fontSize: 14,
    color: '#57636C',
    lineHeight: 20,
    marginTop: 8,
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
  },
  expandedContent: {
    paddingVertical: 12,
  },
<<<<<<< HEAD
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  ingredientsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  exploreTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 24,
    marginBottom: 12,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  dessertContainer: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  dessertHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dessertHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  dessertHeading: {
    fontSize: 28,
    color: '#9439EF',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dessertMainImage: {
    width: '100%',
    height: 230,
    borderRadius: 12,
    marginBottom: 20,
  },
  dessertTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  dessertDescription: {
    fontSize: 12,
    marginBottom: 10,
  },
  dessertPrice: {
    fontSize: 26,
    textDecorationLine: 'underline',
    marginBottom: 12,
  },
  dessertButton: {
    backgroundColor: '#9439EF',
    paddingVertical: 10,
    borderRadius: 8,
    width: 100,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  dessertButtonText: {
    color: '#fff',
  },
  dessertExplore: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  dessertImageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dessertThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  dessertHomeButton: {
    backgroundColor: '#9439EF',
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  dessertHomeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  safe: { 
    flex: 1, 
    backgroundColor: '#f7f7f7'
  },
  burgerContainer: { 
    padding: 16
  },
  burgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  burgerHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    color: '#9439EF',
    marginBottom: 10,
    textAlign: 'center',
  },
  burgerImage: {
    height: 230,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  burgerTitle: {
    fontSize: 20,
    color: '#9439EF',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  burgerDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  burgerBody: {
    fontSize: 14,
    color: '#333',
    marginVertical: 16,
    textAlign: 'center',
  },
  burgerExplore: {
    fontSize: 16,
    marginTop: 40,
    fontWeight: '500',
    color: '#333',
  },
  burgerThumbRow: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  burgerThumb: {
=======
  recipeDescription: {
    fontSize: 14,
    color: '#57636C',
    lineHeight: 20,
  },
  exploreTitle: {
    fontSize: 16,
    color: '#57636C',
    marginTop: 24,
    marginBottom: 12,
  },
  recipesScroll: {
    marginBottom: 24,
  },
  recipeThumbnail: {
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
<<<<<<< HEAD
  },
  burgerNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  burgerNavText: {
    fontSize: 12,
    color: '#57636C',
    marginTop: 4,
    textAlign: 'center',
  },
  favContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  favHeader: {
    height: 144,
    backgroundColor: '#9439EF',
    padding: 24,
    paddingBottom: 48,
  },
  favHeaderTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  favHeaderSubtitle: {
    fontSize: 16,
    color: '#FFF3E0',
  },
  searchContainer: {
    padding: 16,
    marginTop: -24,
=======
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  bottomNav: {
    height: 80,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
  // Header styles
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#101213',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#57636C',
  },
  // Search bar styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
=======
    backgroundColor: '#F1F4F8',
    borderRadius: 12,
    paddingHorizontal: 12,
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
<<<<<<< HEAD
    fontSize: 16,
    color: '#101213',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dishImage: {
    width: 100,
    height: 100,
=======
    height: 44,
    color: '#101213',
  },
  // Dish card styles
  listContainer: {
    paddingHorizontal: 16,
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 12,
  },
  dishImage: {
    width: 80,
    height: 80,
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
    borderRadius: 8,
  },
  dishInfo: {
    flex: 1,
<<<<<<< HEAD
    marginLeft: 16,
  },
  dishName: {
    fontSize: 20,
    color: '#101213',
    fontWeight: '600',
=======
    marginLeft: 12,
    justifyContent: 'center',
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101213',
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#57636C',
    marginLeft: 4,
  },
  dishDescription: {
<<<<<<< HEAD
    fontSize: 14,
    color: '#57636C',
  },
  favoriteButton: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles for PastaScreen
  pastaSafeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  pastaContainer: {
    flex: 1,
  },
  pastaAppBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pastaAppBarTitle: {
    fontSize: 20,
    color: '#101213',
    fontWeight: 'bold',
  },
  pastaContent: {
    flex: 1,
  },
  pastaSection: {
    paddingHorizontal: 16,
  },
  pastaSectionTitle: {
    fontSize: 24,
    color: '#9439EF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  pastaRecipeImageContainer: {
    width: '100%',
    height: 270,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pastaRecipeImage: {
    width: '100%',
    height: '100%',
  },
  pastaExpandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  pastaRecipeTitle: {
    fontSize: 20,
    color: '#9439EF',
    fontWeight: '600',
  },
  pastaCollapsedContent: {
    fontSize: 12,
    color: '#57636C',
    lineHeight: 18,
    marginTop: 8,
  },
  pastaExpandedContent: {
    paddingVertical: 12,
  },
  pastaRecipeDescription: {
=======
    fontSize: 12,
    color: '#57636C',
  },
  favoriteButton: {
    justifyContent: 'center',
    padding: 8,
  },
  // Category card styles
  categoryCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImage: {
    width: '100%',
    height: 180,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#101213',
    padding: 16,
  },
  // Diet item styles
  dietItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dietImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  dietInfo: {
    flex: 1,
    marginLeft: 16,
  },
  dietTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101213',
  },
  // Share screen styles
  headerContainer: {
    padding: 16,
  },
  expandableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#101213',
  },
  expandableContent: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  expandableText: {
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
    fontSize: 14,
    color: '#57636C',
    lineHeight: 20,
  },
<<<<<<< HEAD
  pastaExploreTitle: {
    fontSize: 16,
    color: '#57636C',
    marginTop: 24,
    marginBottom: 12,
  },
  pastaRecipesScroll: {
    marginBottom: 24,
  },
  pastaRecipeThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  pastaThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  pastaBottomNav: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingHorizontal: 16,
  },
  pastaNavButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastaNavButtonText: {
    fontSize: 12,
    color: '#57636C',
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#57636C',
    marginTop: 4,
    fontFamily: 'Manrope',
  },
  optionItem: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderColor: '#eaeaea',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#343a40',
    fontWeight: '500',
    flex: 1,
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  cuisineContent: {
    paddingHorizontal: 16,
  },
  cuisineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 8,
    padding: 8,
  },
  cuisineImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 8,
  },
  cuisineInfo: {
    flex: 1,
  },
  cuisineName: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'InterTight',
  },
  // Styles for ShareScreen
  shareContainer: {
    flex: 1,
    backgroundColor: '#f5f5f6',
  },
  shareAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(245, 245, 246, 0.66)',
  },
  shareAppBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  shareScrollView: {
    flex: 1,
  },
  shareHeaderContainer: {
    padding: 16,
  },
  shareHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  shareRecipeImageContainer: {
    width: '100%',
    height: 230,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  shareRecipeImage: {
    width: '100%',
    height: '100%',
  },
  shareExpandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  shareExpandableTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  shareExpandableContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  shareExpandableText: {
    fontSize: 14,
    color: '#666',
  },
  shareCollapsedText: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  shareDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  shareSocialMediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  shareSocialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  shareSocialButton: {
    alignItems: 'center',
  },
  shareSocialIcon: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
  },
  shareSocialText: {
    fontSize: 14,
  },
  shareButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  shareButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 8,
  },
  shareHomeButton: {
    backgroundColor: '#9439EF',
    borderWidth: 1,
    borderColor: '#9439EF',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Notification Styles
  notificationButton: {
    backgroundColor: '#9439ef',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%'
  },
  notificationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clearButton: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 16,
  },
  testButton: {
    backgroundColor: '#9439ef',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 10,
    fontSize: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  notificationIcon: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#6c757d',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 16,
    color: '#28a745',
  },
  statusDenied: {
    color: '#dc3545',
  },
  statusWarning: {
    fontSize: 14,
    color: '#ffc107',
    marginTop: 8,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 8,
  },
  debugInfo: {
    fontSize: 14,
    color: '#343a40',
  },
  refreshButton: {
    backgroundColor: '#9439ef',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notificationId: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
  },
  settingsScrollView: {
    flex: 1,
  },
});
=======
  collapsedText: {
    fontSize: 14,
    color: '#57636C',
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  socialMediaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#101213',
    marginLeft: 16,
    marginBottom: 16,
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  socialButton: {
    alignItems: 'center',
  },
  socialIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  socialText: {
    fontSize: 14,
    color: '#57636C',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: '#F1F4F8',
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: '#9439EF',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Added scrollView style
  scrollView: {
    flex: 1,
  }
});

export default App;
>>>>>>> 5eb9116dc65e2ff695dda1b15091e75a4ff55fda
