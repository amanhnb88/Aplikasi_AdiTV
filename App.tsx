import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator, Modal, TextInput, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';

const TMDB_API_KEY = "b030404650f279792a8d3287232358e3"; // API Key dari file Adicinemax21.kt

const THEME = {
  bg: '#050B14', cardBg: '#111A2E', sidebarBg: '#03070E',
  primary: '#2B52C3', active: '#4A90E2', text: '#FFFFFF',
  textMuted: '#888888', red: '#E50914',
};

// --- 1. PEMUTAR VIDEO (VIDSRC) ---
const VideoPlayerModal = ({ videoUrl, visible, onClose }: { videoUrl: string | null, visible: boolean, onClose: () => void }) => {
  if (!videoUrl) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <SafeAreaView style={{ position: 'absolute', top: 15, right: 20, zIndex: 10 }}>
          <TouchableOpacity onPress={onClose} style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 30 }}>
            <Icon name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        </SafeAreaView>
        <WebView 
          source={{ uri: videoUrl }} style={{ flex: 1, backgroundColor: '#000' }}
          allowsFullscreenVideo={true} javaScriptEnabled={true} domStorageEnabled={true}
        />
      </View>
    </Modal>
  );
};

// --- 2. LAYAR DETAIL FILM (SESUAI SKETSA) ---
const DetailMovieModal = ({ movieId, mediaType, visible, onClose }: { movieId: string | null, mediaType: string, visible: boolean, onClose: () => void }) => {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videoUrlToPlay, setVideoUrlToPlay] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        // Ambil data film + data aktor (credits)
        const type = mediaType === 'tv' ? 'tv' : 'movie';
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}?api_key=${TMDB_API_KEY}&language=id-ID&append_to_response=credits`);
        const data = await res.json();
        setDetail(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchDetail();
  }, [movieId]);

  if (!visible || !movieId) return null;

  const handlePlay = () => {
    // Format Vidsrc: Untuk film biasa atau TV series (kita set S1E1 sebagai default untuk TV)
    const url = mediaType === 'tv' ? `https://vidsrc.cc/v2/embed/tv/${movieId}/1/1` : `https://vidsrc.cc/v2/embed/movie/${movieId}`;
    setVideoUrlToPlay(url);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <VideoPlayerModal videoUrl={videoUrlToPlay} visible={!!videoUrlToPlay} onClose={() => setVideoUrlToPlay(null)} />
        
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color={THEME.active} /></View>
        ) : detail && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* BACKDROP POSTER & TOMBOL BACK */}
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: `https://image.tmdb.org/t/p/original${detail.backdrop_path}` }} style={{ width: '100%', height: 280 }} />
              {/* Efek Gradasi Gelap (Simulasi) */}
              <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 100, backgroundColor: 'rgba(5, 11, 20, 0.8)' }} />
              <SafeAreaView style={{ position: 'absolute', top: 10, left: 15 }}>
                <TouchableOpacity onPress={onClose} style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 }}>
                  <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
              </SafeAreaView>
            </View>

            {/* INFO FILM */}
            <View style={{ padding: 20, marginTop: -30 }}>
              <Text style={{ color: THEME.text, fontSize: 28, fontWeight: 'bold', marginBottom: 5 }}>{detail.title || detail.name}</Text>
              <Text style={{ color: THEME.textMuted, fontSize: 14, marginBottom: 20 }}>
                {detail.release_date?.substring(0,4) || detail.first_air_date?.substring(0,4)} • {detail.genres?.map((g:any)=>g.name).join(', ')} • ⭐ {detail.vote_average?.toFixed(1)}
              </Text>

              {/* TOMBOL PLAY & TRAILER */}
              <View style={{ flexDirection: 'row', marginBottom: 25 }}>
                <TouchableOpacity style={[styles.btnPrimary, { flex: 1, justifyContent: 'center' }]} onPress={handlePlay}>
                  <Icon name="play" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnText}>Tonton Sekarang</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnSecondary, { marginLeft: 10 }]}>
                  <Icon name="videocam-outline" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnSecondary, { marginLeft: 10 }]}>
                  <Icon name="bookmark-outline" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* SINOPSIS */}
              <Text style={styles.sectionTitle}>Sinopsis</Text>
              <Text style={{ color: '#DDD', fontSize: 14, lineHeight: 22, marginBottom: 25 }}>
                {detail.overview || "Sinopsis tidak tersedia dalam bahasa Indonesia."}
              </Text>

              {/* PEMERAN (AKTOR) */}
              <Text style={styles.sectionTitle}>Pemeran Utama</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingBottom: 20 }}>
                {detail.credits?.cast?.slice(0, 10).map((actor: any) => (
                  <View key={actor.id} style={{ alignItems: 'center', marginRight: 15, width: 80 }}>
                    <Image 
                      source={{ uri: actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'https://via.placeholder.com/150' }} 
                      style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: THEME.cardBg, marginBottom: 8 }} 
                    />
                    <Text style={{ color: THEME.text, fontSize: 12, textAlign: 'center' }} numberOfLines={2}>{actor.name}</Text>
                    <Text style={{ color: THEME.textMuted, fontSize: 10, textAlign: 'center' }} numberOfLines={1}>{actor.character}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

// --- 3. KOMPONEN BERANDA UTAMA ---
const BerandaScreen = ({ isTV }: { isTV?: boolean }) => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // STATE KATEGORI SEPERTI ADICINEMAX21!
  const categories = ['Beranda', 'Film', 'Seri TV', 'Anime', 'Drama Asia'];
  const [activeCategory, setActiveCategory] = useState('Beranda');

  // STATE DETAIL MODAL
  const [selectedMovie, setSelectedMovie] = useState<{id: string, type: string} | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}&language=id-ID`;
        
        // LOGIKA KATEGORI SAKTI TMDB
        if (activeCategory === 'Film') url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=id-ID&sort_by=popularity.desc`;
        else if (activeCategory === 'Seri TV') url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=id-ID&sort_by=popularity.desc`;
        else if (activeCategory === 'Anime') url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=id-ID&with_genres=16&with_original_language=ja`; // Genre 16 = Animasi, ja = Jepang
        else if (activeCategory === 'Drama Asia') url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=id-ID&with_original_language=ko|zh|th`; // ko=Korea, zh=China, th=Thai

        const response = await fetch(url);
        const data = await response.json();
        setMovies(data.results);
      } catch (error) { console.error(error); }
      setLoading(false);
    };
    fetchMovies();
  }, [activeCategory]);

  return (
    <View style={styles.screenContainer}>
      {/* Panggil Modal Detail */}
      <DetailMovieModal 
        movieId={selectedMovie?.id || null} 
        mediaType={selectedMovie?.type || 'movie'} 
        visible={!!selectedMovie} 
        onClose={() => setSelectedMovie(null)} 
      />
      
      {/* MENU KATEGORI ADICINEMAX */}
      <View style={{ paddingTop: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Utama */}
        {activeCategory === 'Beranda' && (
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?q=80&w=1000&auto=format&fit=crop' }} 
            style={[styles.banner, isTV ? { height: 350 } : { height: 220 }]}
            imageStyle={{ borderRadius: 16, opacity: 0.6 }}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerBadge}>LIVE</Text>
              <Text style={styles.bannerTitle}>Siaran Nasional</Text>
              <Text style={styles.bannerSubtitle}>Tonton siaran TV favoritmu sekarang.</Text>
            </View>
          </ImageBackground>
        )}

        {/* KONTEN FILM BERDASARKAN KATEGORI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{activeCategory === 'Beranda' ? 'Sedang Tren' : `Rekomendasi ${activeCategory}`}</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={THEME.active} style={{ marginTop: 20 }} />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {movies.map((movie) => {
              // TMDB mengembalikan media_type untuk trending, untuk discover kita tentukan manual
              const type = movie.media_type || (activeCategory === 'Film' ? 'movie' : 'tv');
              return (
                <TouchableOpacity 
                  key={movie.id} 
                  style={styles.movieCardGrid} 
                  onPress={() => setSelectedMovie({ id: movie.id.toString(), type })}
                >
                  <Image source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} style={styles.moviePosterGrid} />
                  <Text style={styles.movieTitleGrid} numberOfLines={2}>{movie.title || movie.name}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

// --- KOMPONEN PENCARIAN FILM ---
const CariScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<{id: string, type: string} | null>(null);

  const searchMovies = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=id-ID&query=${query}`);
      const data = await response.json();
      setResults(data.results.filter((item:any) => item.media_type !== 'person'));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <View style={styles.screenContainer}>
      <DetailMovieModal movieId={selectedMovie?.id || null} mediaType={selectedMovie?.type || 'movie'} visible={!!selectedMovie} onClose={() => setSelectedMovie(null)} />
      
      <Text style={styles.sectionTitle}>Pencarian</Text>
      <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 10 }}>
        <TextInput 
          style={styles.searchInput} placeholder="Ketik judul film/series..." placeholderTextColor="#888"
          value={query} onChangeText={setQuery} onSubmitEditing={searchMovies}
        />
        <TouchableOpacity style={styles.btnSearch} onPress={searchMovies}><Icon name="search" size={24} color="#FFF" /></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color={THEME.active} /> : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {results.map((movie) => (
            <TouchableOpacity key={movie.id} style={styles.searchResultCard} onPress={() => setSelectedMovie({ id: movie.id.toString(), type: movie.media_type || 'movie' })}>
              <Image source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }} style={styles.searchThumb} />
              <View style={{ flex: 1, paddingLeft: 15 }}>
                <Text style={styles.movieTitle}>{movie.title || movie.name}</Text>
                <Text style={styles.pluginDesc} numberOfLines={3}>{movie.overview}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// --- LAYOUT & NAVIGASI MOBILE ---
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
          tabBarActiveTintColor: THEME.active, tabBarInactiveTintColor: THEME.textMuted,
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
        <Tab.Screen name="Live TV" children={() => <View style={styles.screenContainer}><Text style={styles.bannerTitle}>Live TV Segera Hadir</Text></View>} />
        <Tab.Screen name="Cari" component={CariScreen} />
        <Tab.Screen name="Akun" children={() => <View style={styles.screenContainer}><Text style={styles.bannerTitle}>Profil Akun</Text></View>} />
      </Tab.Navigator>
    </NavigationContainer>
  </SafeAreaView>
);

export default function App() {
  return <SafeAreaProvider><MobileLayout /></SafeAreaProvider>;
}

// --- 🎨 STYLE (TERMASUK STYLE DETAIL BARU) ---
const styles = StyleSheet.create({
  logoText: { color: THEME.text, fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  screenContainer: { flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 15 },
  mobileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  
  categoryScroll: { maxHeight: 40, marginBottom: 15 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, backgroundColor: THEME.cardBg },
  categoryPillActive: { backgroundColor: THEME.primary },
  categoryText: { color: THEME.textMuted, fontSize: 14, fontWeight: '600' },
  categoryTextActive: { color: THEME.text },

  banner: { justifyContent: 'center', marginBottom: 20, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1A2230' },
  bannerContent: { padding: 25, flex: 1, justifyContent: 'center' },
  bannerBadge: { backgroundColor: THEME.red, color: THEME.text, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 10, fontWeight: '900', marginBottom: 10 },
  bannerTitle: { color: THEME.text, fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  bannerSubtitle: { color: '#E0E0E0', fontSize: 14, marginBottom: 20 },
  
  btnPrimary: { backgroundColor: THEME.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  btnSecondary: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: THEME.text, fontWeight: 'bold', fontSize: 14 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  sectionTitle: { color: THEME.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  
  // Grid Film Style
  movieCardGrid: { width: '31%', marginBottom: 20 },
  moviePosterGrid: { width: '100%', aspectRatio: 2/3, borderRadius: 8, backgroundColor: '#1A2230', marginBottom: 8 },
  movieTitleGrid: { color: THEME.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  movieTitle: { color: THEME.text, fontSize: 16, fontWeight: 'bold' },

  // Search
  searchInput: { flex: 1, backgroundColor: '#111A2E', color: '#FFF', borderRadius: 8, paddingHorizontal: 15, height: 50 },
  btnSearch: { backgroundColor: THEME.primary, width: 50, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  searchResultCard: { flexDirection: 'row', backgroundColor: THEME.cardBg, padding: 10, borderRadius: 12, marginBottom: 15 },
  searchThumb: { width: 60, height: 90, borderRadius: 8 },
  pluginDesc: { color: THEME.textMuted, fontSize: 12, lineHeight: 18, marginTop: 5 },
});
