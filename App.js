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
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
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
                resizeMode="cover"
              />
            </View>

            {/* Expandable Recipe Info */}
            <TouchableOpacity 
              style={styles.expandableHeader}
              onPress={toggleExpand}
            >
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#9439EF" 
              />
            </TouchableOpacity>

            {!expanded ? (
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
      </View>
    </SafeAreaView>
  );
};

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
    </SafeAreaView>
  );
};

// Favorites Screen Component
const FavoritesScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  
  const favoriteDishes = [
    { id: 1, name: 'Pasta', rating: 4.6, description: 'Creamy pasta', image: require('./assets/pasta.png') },
    { id: 2, name: 'Beef Burger', rating: 4.7, description: 'Juicy beef patty with toppings', image: require('./assets/Burger.png') },
    { id: 3, name: 'Seasonal Spinach Salad', rating: 4.5, description: 'Crisp romaine with Caesar dressing', image: require('./assets/Salad.png') },
    { id: 4, name: 'Margherita Pizza', rating: 4.9, description: 'Classic Italian pizza', image: require('./assets/Pizza.png') }
  ];

  const filteredDishes = favoriteDishes.filter(dish =>
    dish.name.toLowerCase().includes(searchText.toLowerCase()) ||
    dish.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorite Dishes</Text>
        <Text style={styles.headerSubtitle}>Your culinary treasures in one place</Text>
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
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart" size={24} color="#FF0000" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

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
  };

  return (
    <SafeAreaView style={styles.container}>
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
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
      </ScrollView>
    </SafeAreaView>
  );
};

// Settings Screen Component
const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Settings Screen</Text>
      <Text style={styles.headerSubtitle}>App preferences and settings</Text>
    </View>
  );
};

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
    </NavigationContainer>
  );
};

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
    marginBottom: 16,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recipeTitle: {
    fontSize: 20,
    color: '#9439EF',
    fontWeight: '600',
  },
  collapsedContent: {
    fontSize: 14,
    color: '#57636C',
    lineHeight: 20,
    marginTop: 8,
  },
  expandedContent: {
    paddingVertical: 12,
  },
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
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4F8',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
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
    borderRadius: 8,
  },
  dishInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#101213',
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
    fontSize: 14,
    color: '#57636C',
    lineHeight: 20,
  },
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
