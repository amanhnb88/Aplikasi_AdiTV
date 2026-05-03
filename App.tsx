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
  TextInput, 
  Dimensions 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

// Import Komponen Detail Premium kita
import MediaDetailScreen from './src/screens/MediaDetailScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
[span_0](start_span)const TMDB_API_KEY = "b030404650f279792a8d3287232358e3";[span_0](end_span)

const THEME = {
  [span_1](start_span)bg: '#050B14',[span_1](end_span)
  [span_2](start_span)cardBg: '#111A2E',[span_2](end_span)
  [span_3](start_span)primary: '#E50914',[span_3](end_span)
  [span_4](start_span)text: '#FFFFFF',[span_4](end_span)
  [span_5](start_span)textMuted: '#888888',[span_5](end_span)
};

// ==========================================
// 1. PEMUTAR VIDEO (NETFLIX STYLE)
// ==========================================
const CustomVideoPlayer = ({ videoUrl, title, visible, onClose }: any) => {
  [span_6](start_span)const [paused, setPaused] = useState(false);[span_6](end_span)
  [span_7](start_span)const [showControls, setShowControls] = useState(true);[span_7](end_span)

  [span_8](start_span)if (!visible || !videoUrl) return null;[span_8](end_span)

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFill} onPress={() => setShowControls(!showControls)}>
          <Video 
            source={{ uri: videoUrl }} 
            [span_9](start_span)style={StyleSheet.absoluteFill}[span_9](end_span)
            [span_10](start_span)paused={paused}[span_10](end_span)
            resizeMode="contain" 
          />
        </TouchableOpacity>

        {showControls && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'space-between' }]}>
            <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
              [span_11](start_span)<TouchableOpacity onPress={onClose}><Icon name="arrow-back" size={28} color="#FFF" /></TouchableOpacity>[span_11](end_span)
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 15 }}>{title}</Text>
            </SafeAreaView>

            <View style={{ alignSelf: 'center' }}>
              <TouchableOpacity onPress={() => setPaused(!paused)}>
                <Icon name={paused ? [span_12](start_span)"play" : "pause"} size={60} color="#FFF" />[span_12](end_span)
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
const MovieRow = ({ title, fetchUrl, type, onMoviePress }: any) => {
  [span_13](start_span)const [movies, setMovies] = useState<any[]>([]);[span_13](end_span)
  useEffect(() => { 
    fetch(fetchUrl)
      .then(r => r.json())
      .then(d => setMovies(d.results))
      .catch(e => console.error(e)); 
  [span_14](start_span)}, [fetchUrl]);[span_14](end_span)

  return (
    <View style={{ marginBottom: 25 }}>
      [span_15](start_span)<Text style={styles.sectionTitle}>{title}</Text>[span_15](end_span)
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
// 3. SCREEN UTAMA (BERANDA & CARI)
// ==========================================
const BerandaScreen = ({ onMoviePress }: any) => (
  <ScrollView style={{ flex: 1, backgroundColor: THEME.bg }}>
    [span_16](start_span)<ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af' }} style={styles.banner}>[span_16](end_span)
      <View style={styles.bannerOverlay}>
        [span_17](start_span)<Text style={styles.bannerTitle}>SIARAN NASIONAL</Text>[span_17](end_span)
        <TouchableOpacity style={styles.btnPlayBanner}>
          <Icon name="play" size={20} color="#000" />
          <Text style={{ color: '#000', fontWeight: 'bold', marginLeft: 5 }}>Putar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>

    [span_18](start_span)<MovieRow title="Sedang Tren" fetchUrl={`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`} onMoviePress={onMoviePress} />[span_18](end_span)
    [span_19](start_span)<MovieRow title="Film Terpopuler" fetchUrl={`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}`} type="movie" onMoviePress={onMoviePress} />[span_19](end_span)
    [span_20](start_span)<MovieRow title="Seri TV Pilihan" fetchUrl={`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}`} type="tv" onMoviePress={onMoviePress} />[span_20](end_span)
  </ScrollView>
);

// ==========================================
// 4. LOGIKA NAVIGASI & STATE GLOBAL
// ==========================================
[span_21](start_span)const Tab = createBottomTabNavigator();[span_21](end_span)

export default function App() {
  [span_22](start_span)const [selectedMedia, setSelectedMedia] = useState<any>(null);[span_22](end_span)
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");

  const handleOpenDetail = (media: any) => {
    // Kita standarisasi datanya agar cocok dengan MediaDetailScreen
    const detail = {
      ...media,
      [span_23](start_span)year: media.release_date?.substring(0,4) || media.first_air_date?.substring(0,4),[span_23](end_span)
      [span_24](start_span)rating: (media.vote_average * 10).toFixed(0) + '% Match',[span_24](end_span)
      [span_25](start_span)synopsis: media.overview,[span_25](end_span)
      [span_26](start_span)poster_path: `https://image.tmdb.org/t/p/w500${media.poster_path}`,[span_26](end_span)
      [span_27](start_span)backdrop_path: `https://image.tmdb.org/t/p/original${media.backdrop_path}`[span_27](end_span)
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
      
      {/* 1. PEMUTAR VIDEO (Layer Paling Atas) */}
      <CustomVideoPlayer 
        visible={!!videoUrl} 
        videoUrl={videoUrl} 
        title={videoTitle} 
        onClose={() => setVideoUrl(null)} 
      />

      {/* 2. MODAL DETAIL PREMIUM (Layer Tengah) */}
      <Modal visible={!!selectedMedia} animationType="slide">
        <MediaDetailScreen 
          media={selectedMedia} 
          type={selectedMedia?.media_type === 'tv' ? 'series' : 'movie'}
          onClose={() => setSelectedMedia(null)}
          onPlayVideo={handlePlayVideo} 
        />
      </Modal>

      {/* 3. NAVIGASI UTAMA (Layer Dasar) */}
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ 
          headerShown: false, 
          tabBarStyle: { backgroundColor: THEME.bg, borderTopWidth: 0 },
          tabBarActiveTintColor: '#FFF' 
        }}>
          <Tab.Screen name="Beranda" options={{ tabBarIcon: ({color}) => <Icon name="home" size={24} color={color}/> }}>
            {() => <BerandaScreen onMoviePress={handleOpenDetail} />}
          </Tab.Screen>
          <Tab.Screen name="Cari" options={{ tabBarIcon: ({color}) => <Icon name="search" size={24} color={color}/> }}>
            {() => <View style={{flex:1, backgroundColor: THEME.bg}}><Text style={{color:'#FFF'}}>Layar Cari</Text></View>}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  [span_28](start_span)sectionTitle: { color: THEME.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 20 },[span_28](end_span)
  [span_29](start_span)movieCard: { width: 110, marginRight: 12 },[span_29](end_span)
  [span_30](start_span)moviePoster: { width: 110, height: 160 },[span_30](end_span)
  [span_31](start_span)banner: { height: 450, justifyContent: 'flex-end' },[span_31](end_span)
  [span_32](start_span)bannerOverlay: { padding: 30, backgroundColor: 'rgba(5,11,20,0.6)' },[span_32](end_span)
  [span_33](start_span)bannerTitle: { color: '#FFF', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 20 },[span_33](end_span)
  [span_34](start_span)btnPlayBanner: { backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 4 },[span_34](end_span)
});
