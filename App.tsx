import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground, 
  Modal, 
  Dimensions, 
  NativeModules 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

// Pastikan file MediaDetailScreen.tsx ada di folder src/screens/
import MediaDetailScreen from './src/screens/MediaDetailScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TMDB_API_KEY = "b030404650f279792a8d3287232358e3";

const THEME = {
  bg: '#050B14',
  cardBg: '#111A2E',
  primary: '#E50914',
  text: '#FFFFFF',
  textMuted: '#888888',
};

// ==========================================
// 1. PEMUTAR VIDEO (NETFLIX STYLE)
// ==========================================
const CustomVideoPlayer = ({ videoUrl, title, visible, onClose }: any) => {
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);

  if (!visible || !videoUrl) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFill} onPress={() => setShowControls(!showControls)}>
          <Video 
            source={{ uri: videoUrl }} 
            style={StyleSheet.absoluteFill}
            paused={paused}
            resizeMode="contain" 
          />
        </TouchableOpacity>

        {showControls && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'space-between' }]}>
            <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
              <TouchableOpacity onPress={onClose}>
                <Icon name="arrow-back" size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 15 }}>{title}</Text>
            </SafeAreaView>

            <View style={{ alignSelf: 'center' }}>
              <TouchableOpacity onPress={() => setPaused(!paused)}>
                <Icon name={paused ? "play" : "pause"} size={60} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={{ height: 60 }} />
          </View>
        )}
      </View>
    </Modal>
  );
};

// ==========================================
// 2. BARIS FILM (MOVIE ROW)
// ==========================================
const MovieRow = ({ title, fetchUrl, onMoviePress }: any) => {
  const [movies, setMovies] = useState<any[]>([]);
  
  useEffect(() => { 
    fetch(fetchUrl)
      .then(r => r.json())
      .then(d => setMovies(d.results))
      .catch(e => console.error(e)); 
  }, [fetchUrl]);

  if (movies.length === 0) return null;

  return (
    <View style={{ marginBottom: 25 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
        {movies.map(movie => (
          <TouchableOpacity key={movie.id} style={styles.movieCard} onPress={() => onMoviePress(movie)}>
            <ImageBackground 
              source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} 
              style={styles.moviePoster} 
              imageStyle={{ borderRadius: 4 }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// ==========================================
// 3. LAYAR BERANDA
// ==========================================
const BerandaScreen = ({ onMoviePress }: any) => (
  <ScrollView style={{ flex: 1, backgroundColor: THEME.bg }}>
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af' }} 
      style={styles.banner}
    >
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerTitle}>SIARAN NASIONAL</Text>
        <TouchableOpacity style={styles.btnPlayBanner}>
          <Icon name="play" size={20} color="#000" />
          <Text style={{ color: '#000', fontWeight: 'bold', marginLeft: 5 }}>Putar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>

    <MovieRow title="Sedang Tren" fetchUrl={`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`} onMoviePress={onMoviePress} />
    <MovieRow title="Film Populer" fetchUrl={`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}`} onMoviePress={onMoviePress} />
    <MovieRow title="Seri TV Pilihan" fetchUrl={`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}`} onMoviePress={onMoviePress} />
  </ScrollView>
);

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================
const Tab = createBottomTabNavigator();

export default function App() {
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");

  const handleOpenDetail = (media: any) => {
    // Standarisasi data agar cocok dengan MediaDetailScreen
    const detail = {
      ...media,
      title: media.title || media.name,
      year: media.release_date?.substring(0,4) || media.first_air_date?.substring(0,4),
      rating: (media.vote_average * 10).toFixed(0) + '% Match',
      synopsis: media.overview,
      poster_path: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
      backdrop_path: `https://image.tmdb.org/t/p/original${media.backdrop_path}`
    };
    setSelectedMedia(detail);
  };

  const handlePlayVideo = (url: string, title: string) => {
    setVideoUrl(url);
    setVideoTitle(title);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      
      {/* 1. PEMUTAR VIDEO (Layer Atas) */}
      <CustomVideoPlayer 
        visible={!!videoUrl} 
        videoUrl={videoUrl} 
        title={videoTitle} 
        onClose={() => setVideoUrl(null)} 
      />

      {/* 2. LAYAR DETAIL PREMIUM (Layer Tengah) */}
      <Modal visible={!!selectedMedia} animationType="slide" onRequestClose={() => setSelectedMedia(null)}>
        <MediaDetailScreen 
          media={selectedMedia} 
          type={selectedMedia?.first_air_date ? 'series' : 'movie'}
          onClose={() => setSelectedMedia(null)}
          onPlayVideo={handlePlayVideo} 
        />
      </Modal>

      {/* 3. NAVIGASI (Layer Dasar) */}
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ 
          headerShown: false, 
          tabBarStyle: { backgroundColor: 'rgba(5, 11, 20, 0.9)', borderTopWidth: 0 },
          tabBarActiveTintColor: '#FFF' 
        }}>
          <Tab.Screen 
            name="Beranda" 
            options={{ tabBarIcon: ({color}) => <Icon name="home" size={24} color={color}/> }}
          >
            {() => <BerandaScreen onMoviePress={handleOpenDetail} />}
          </Tab.Screen>
          <Tab.Screen 
            name="Cari" 
            options={{ tabBarIcon: ({color}) => <Icon name="search" size={24} color={color}/> }}
          >
            {() => <View style={{flex:1, backgroundColor: THEME.bg}}><Text style={{color:'#FFF', padding: 20}}>Layar Cari</Text></View>}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: THEME.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 20 },
  movieCard: { width: 110, marginRight: 12 },
  moviePoster: { width: 110, height: 160, borderRadius: 4 },
  banner: { height: 450, justifyContent: 'flex-end' },
  bannerOverlay: { padding: 30, backgroundColor: 'rgba(5,11,20,0.6)' },
  bannerTitle: { color: '#FFF', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  btnPlayBanner: { backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 4 },
});
