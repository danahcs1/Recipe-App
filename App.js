import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder for missing image assets
const placeholderImage = "https://via.placeholder.com/150";

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
  <TouchableOpacity style={[styles.optionButton, style]} onPress={onPress}>
    <Text style={[styles.optionText, textStyle]}>{title}</Text>
    <Ionicons name={icon} size={24} color={iconColor} />
  </TouchableOpacity>
);

// ============================
// AUTHENTICATION SCREENS
// ============================

const WelcomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Image 
      source={{ uri: placeholderImage }}
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
  
  const handleLogin = () => {
    // Add validation here
    if (email.trim() === '' || password.trim() === '') {
      showAlert('Error', 'Please fill all fields');
      return;
    }
    navigation.navigate('MainTabs');
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
        title="Sign In" 
        onPress={handleLogin}
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
  
  const handleRegister = () => {
    // Add validation here
    if (email.trim() === '' || password.trim() === '') {
      showAlert('Error', 'Please fill all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }
    
    navigation.navigate('MainTabs');
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
        title="Register" 
        onPress={handleRegister}
      />
    </View>
  );
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  
  const handleSendReset = () => {
    if (email.trim() === '') {
      showAlert('Error', 'Please enter your email');
      return;
    }
    
    showAlert('Success', 'Password reset link sent to your email');
    navigation.navigate('Login');
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <CustomInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <CustomButton 
        title="Send Reset Link" 
        onPress={handleSendReset}
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
  const [email, setEmail] = useState('john.doe@example.com');
  
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
// MAIN TAB SCREENS
// ============================

const SettingsScreen = ({ navigation }) => {
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        navigation.navigate('Welcome');
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
            onPress: () => navigation.navigate('Welcome'),
          },
        ]
      );
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        
        <OptionItem 
          title="Allergies" 
          onPress={() => navigation.navigate('Allergies')}
          icon="chevron-forward"
        />
        
        <OptionItem 
          title="Phone Number" 
          onPress={() => navigation.navigate('PhoneNumber')}
          icon="chevron-forward"
        />
        
        <OptionItem 
          title="Language" 
          onPress={() => navigation.navigate('Language')}
          icon="chevron-forward"
        />
        
        <OptionItem 
          title="Profile Settings" 
          onPress={() => navigation.navigate('ProfileSettings')}
          icon="chevron-forward"
        />
        
        <OptionItem 
          title="Log out" 
          onPress={handleLogout}
          icon="log-out-outline"
          iconColor="#ff4d4d"
          style={{ backgroundColor: '#ffecec' }}
          textStyle={{ color: '#ff4d4d' }}
        />
      </View>
    </ScrollView>
  );
};

const RecipeCategoriesScreen = ({ navigation }) => {
  const categories = [
    { id: 1, name: 'Cuisine', image: placeholderImage },
    { id: 2, name: 'Dishes', image: placeholderImage },
    { id: 3, name: 'Diet', image: placeholderImage },
  ];

  return (
    <View style={styles.containerPadded}>
      <Text style={styles.title}>Recipes</Text>
      
      {categories.map((category) => (
        <TouchableOpacity 
          key={category.id} 
          style={styles.categoryButton}
          onPress={() => navigation.navigate('CategoryDetails', { category: category.name })}
        >
          <Image source={{ uri: category.image }} style={styles.categoryImage} />
          <Text style={styles.categoryText}>{category.name}</Text>
          <Ionicons name="chevron-forward" size={24} color="#8A2BE2" style={styles.categoryIcon} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const CoursesScreen = ({ navigation }) => {
  const courses = [
    { id: 1, name: 'Bread', image: placeholderImage },
    { id: 2, name: 'Dessert', image: placeholderImage },
    { id: 3, name: 'Appetizers', image: placeholderImage },
    { id: 4, name: 'Soup', image: placeholderImage },
  ];

  return (
    <ScrollView>
      <View style={styles.containerPadded}>
        <Text style={styles.title}>Learn</Text>
        
        {courses.map(course => (
          <TouchableOpacity 
            key={course.id} 
            style={styles.courseButton}
            onPress={() => navigation.navigate('CourseDetails', { course: course.name })}
          > 
            <Image 
              source={{ uri: course.image }} 
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
    { id: 1, name: 'Carrefour', url: 'https://www.carrefourksa.com/', image: placeholderImage },
    { id: 2, name: 'Danube', url: 'https://www.danube.sa/', image: placeholderImage },
    { id: 3, name: 'Tamimi Markets', url: 'https://www.tamimimarkets.com/', image: placeholderImage },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Now</Text>
      
      {stores.map(store => (
        <TouchableOpacity
          key={store.id}
          style={styles.storeButton}
          onPress={() => Linking.openURL(store.url)}>
          <Image source={{ uri: store.image }} style={styles.storeImage} />
          <Text style={styles.storeButtonText}>{store.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

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

export default function App() {
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
        initialRouteName="Welcome"
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
    </NavigationContainer>
  );
}

// Placeholder for category and course detail screens
const PlaceholderScreen = ({ route }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{route.params?.category || route.params?.course}</Text>
    <Text style={styles.subtitle}>Content coming soon</Text>
  </View>
);

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
});