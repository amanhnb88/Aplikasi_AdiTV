import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator, Modal, TextInput, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview'; // Jendela untuk memutar video Vidsrc

const TMDB_API_KEY = "b030404650f279792a8d3287232358e3"; // API Key TMDB

// --- TEMA WARNA ---
const THEME = {
  bg: '#050B14',
  cardBg: '#111A2E',
  sidebarBg: '#03070E',
  primary: '#2B52C3',
  active: '#4A90E2',
  text: '#FFFFFF',
  textMuted: '#888888',
  red: '#E50914',
};

// --- KOMPONEN PEMUTAR VIDEO (MODAL WEBVIEW) ---
const VideoPlayerModal = ({ movieId, visible, onClose }: { movieId: string | null, visible: boolean, onClose: () => void }) => {
  if (!movieId) return null;
  // Memutar video menggunakan URL Vidsrc
  const videoUrl = `https://vidsrc.cc/v2/embed/movie/${movieId}`;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Tombol Tutup (X) */}
        <SafeAreaView style={{ position: 'absolute', top: 15, right: 20, zIndex: 10 }}>
          <TouchableOpacity onPress={onClose} style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 30 }}>
            <Icon name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        </SafeAreaView>
        
        {/* Pemutar Video Web (Vidsrc) */}
        <WebView 
          source={{ uri: videoUrl }}
          style={{ flex: 1, backgroundColor: '#000' }}
          allowsFullscreenVideo={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    </Modal>
  );
};

// --- KOMPONEN KONTEN UTAMA (Beranda) ---
const BerandaScreen = ({ isTV }: { isTV?: boolean }) => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMovieId, setActiveMovieId] = useState<string | null>(null);

  // Mengambil data Trending dari TMDB saat aplikasi dibuka
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=id-ID`);
        const data = await response.json();
        setMovies(data.results);
        setLoading(false);
      } catch (error) {
        console.error("Gagal load TMDB:", error);
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  return (
    <View style={styles.screenContainer}>
      <VideoPlayerModal movieId={activeMovieId} visible={!!activeMovieId} onClose={() => setActiveMovieId(null)} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Utama */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?q=80&w=1000&auto=format&fit=crop' }} 
          style={[styles.banner, isTV ? { height: 350 } : { height: 220 }, { marginTop: 20 }]}
          imageStyle={{ borderRadius: 16, opacity: 0.6 }}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerBadge}>LIVE</Text>
            <Text style={[styles.bannerTitle, isTV && { fontSize: 36 }]}>Siaran Nasional</Text>
            <Text style={styles.bannerSubtitle}>Tonton siaran TV nasional favorit{'\n'}kapan saja, di mana saja.</Text>
            <TouchableOpacity style={styles.btnPrimary}>
              <Icon name="play" size={18} color="#FFF" style={{ marginRight: 5 }} />
              <Text style={styles.btnText}>Tonton Sekarang</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* --- SEKSI FILM TRENDING TMDB --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Box Office Terbaru</Text>
          <Text style={styles.seeAll}>Lihat Semua {'>'}</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={THEME.active} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {movies.map((movie) => (
              <TouchableOpacity 
                key={movie.id} 
                style={styles.movieCard} 
                onPress={() => setActiveMovieId(movie.id.toString())} // Saat diklik, putar film!
              >
                <Image source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} style={styles.moviePoster} />
                <Text style={styles.movieTitle} numberOfLines={1}>{movie.title || movie.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Siaran Nasional */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Siaran Nasional</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {['TVRI', 'RCTI', 'MNCTV', 'GTV', 'iNews', 'ANTV'].map((ch) => (
            <View key={ch} style={styles.cardChannelWhite}>
              <Text style={styles.channelLogoText}>{ch}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

// --- KOMPONEN PENCARIAN FILM (TMDB) ---
const CariScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeMovieId, setActiveMovieId] = useState<string | null>(null);

  const searchMovies = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=id-ID&query=${query}`);
      const data = await response.json();
      setResults(data.results);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <View style={styles.screenContainer}>
      <VideoPlayerModal movieId={activeMovieId} visible={!!activeMovieId} onClose={() => setActiveMovieId(null)} />
      
      <Text style={styles.sectionTitle}>Pencarian Film</Text>
      <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10 }}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Ketik judul film..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchMovies}
        />
        <TouchableOpacity style={styles.btnSearch} onPress={searchMovies}>
          <Icon name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color={THEME.active} /> : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {results.map((movie) => (
            <TouchableOpacity key={movie.id} style={styles.searchResultCard} onPress={() => setActiveMovieId(movie.id.toString())}>
              <Image source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }} style={styles.searchThumb} />
              <View style={{ flex: 1, paddingLeft: 15 }}>
                <Text style={styles.movieTitle}>{movie.title}</Text>
                <Text style={styles.pluginDesc} numberOfLines={3}>{movie.overview}</Text>
                <Text style={styles.pluginAuthor}>⭐ {movie.vote_average}</Text>
              </View>
              <Icon name="play-circle-outline" size={30} color={THEME.active} />
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
};

// Komponen Halaman Kosong
const DummyScreen = ({ title }: { title: string }) => (
  <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={styles.bannerTitle}>{title}</Text>
  </View>
);

// --- 📺 LAYOUT ANDROID TV ---
const TVLayout = () => {
  const [active, setActive] = useState('Home');
  const menus = [
    { name: 'Home', icon: 'home' },
    { name: 'Live TV', icon: 'tv-outline' },
    { name: 'Cari', icon: 'search-outline' }, 
    { name: 'Settings', icon: 'settings-outline' },
  ];

  return (
    <View style={styles.tvContainer}>
      <View style={styles.tvSidebar}>
        <View style={styles.tvLogoArea}>
          <Text style={styles.logoText}>ADITV</Text>
        </View>
        <ScrollView>
          {menus.map((m) => (
            <TouchableOpacity key={m.name} onPress={() => setActive(m.name)} style={[styles.tvMenuItem, active === m.name && styles.tvMenuItemActive]}>
              <Icon name={m.icon} size={22} color={active === m.name ? THEME.text : THEME.textMuted} style={{ marginRight: 15 }} />
              <Text style={[styles.tvMenuText, active === m.name && styles.tvMenuTextActive]}>{m.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>
        {active === 'Home' ? <BerandaScreen isTV={true} /> : 
         active === 'Cari' ? <CariScreen /> : <DummyScreen title={active} />}
      </View>
    </View>
  );
};

// --- 📱 LAYOUT MOBILE ---
const Tab = createBottomTabNavigator();
const MobileLayout = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
    <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
    <View style={styles.mobileHeader}>
      <Text style={styles.logoText}>ADITV</Text>
    </View>

    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: THEME.sidebarBg, borderTopColor: '#1A2230', height: 65, paddingBottom: 10, paddingTop: 10 },
          tabBarActiveTintColor: THEME.active,
          tabBarInactiveTintColor: THEME.textMuted,
          tabBarIcon: ({ color }) => {
            let iconName = 'home';
            if (route.name === 'Live TV') iconName = 'tv-outline';
            if (route.name === 'Cari') iconName = 'search-outline';
            if (route.name === 'Akun') iconName = 'person-outline';
            return <Icon name={iconName} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Beranda" component={BerandaScreen} />
        <Tab.Screen name="Live TV" children={() => <DummyScreen title="Live TV" />} />
        {/* Tab Plugin resmi diganti jadi Pencarian Film! */}
        <Tab.Screen name="Cari" component={CariScreen} />
        <Tab.Screen name="Akun" children={() => <DummyScreen title="Akun" />} />
      </Tab.Navigator>
    </NavigationContainer>
  </SafeAreaView>
);

// --- 🚀 ROOT APP ---
export default function App() {
  return <SafeAreaProvider>{Platform.isTV ? <TVLayout /> : <MobileLayout />}</SafeAreaProvider>;
}

// --- 🎨 STYLE ---
const styles = StyleSheet.create({
  logoText: { color: THEME.text, fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  screenContainer: { flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 20 },
  mobileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  tvTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 30 },
  
  // Banner
  banner: { justifyContent: 'center', marginBottom: 25, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1A2230' },
  bannerContent: { padding: 25, flex: 1, justifyContent: 'center' },
  bannerBadge: { backgroundColor: THEME.red, color: THEME.text, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 10, fontWeight: '900', marginBottom: 15 },
  bannerTitle: { color: THEME.text, fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  bannerSubtitle: { color: '#E0E0E0', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  btnPrimary: { backgroundColor: THEME.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginRight: 10 },
  btnText: { color: THEME.text, fontWeight: 'bold', fontSize: 14 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: THEME.text, fontSize: 18, fontWeight: 'bold' },
  horizontalScroll: { paddingBottom: 20 },
  cardChannelWhite: { backgroundColor: '#F0F0F0', width: 110, height: 80, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  channelLogoText: { color: '#000', fontSize: 22, fontWeight: '900', fontStyle: 'italic' },

  // Film Cards
  movieCard: { width: 120, marginRight: 15 },
  moviePoster: { width: 120, height: 180, borderRadius: 12, backgroundColor: '#1A2230', marginBottom: 8 },
  movieTitle: { color: THEME.text, fontSize: 14, fontWeight: 'bold' },

  // Search Screen
  searchInput: { flex: 1, backgroundColor: '#111A2E', color: '#FFF', borderRadius: 8, paddingHorizontal: 15, height: 50, borderColor: '#1A2230', borderWidth: 1 },
  btnSearch: { backgroundColor: THEME.primary, width: 50, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  searchResultCard: { flexDirection: 'row', backgroundColor: THEME.cardBg, padding: 10, borderRadius: 12, marginBottom: 15, alignItems: 'center', borderColor: '#1A2230', borderWidth: 1 },
  searchThumb: { width: 60, height: 90, borderRadius: 8 },
  pluginDesc: { color: THEME.textMuted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  pluginAuthor: { color: THEME.active, fontSize: 12, marginTop: 5, fontWeight: 'bold' },

  // TV Sidebar
  tvContainer: { flex: 1, flexDirection: 'row', backgroundColor: THEME.bg },
  tvSidebar: { width: 240, backgroundColor: THEME.sidebarBg, paddingTop: 40, borderRightWidth: 1, borderColor: '#1A2230' },
  tvLogoArea: { paddingLeft: 30, marginBottom: 40 },
  tvMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingLeft: 30, marginBottom: 5, borderRadius: 8, marginHorizontal: 10 },
  tvMenuItemActive: { backgroundColor: THEME.primary },
  tvMenuText: { color: THEME.textMuted, fontSize: 16, fontWeight: '600' },
  tvMenuTextActive: { color: THEME.text },
});
