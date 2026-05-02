import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator, Modal, TextInput, Image, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TMDB_API_KEY = "b030404650f279792a8d3287232358e3"; 

const THEME = {
  bg: '#050B14', cardBg: '#111A2E', sidebarBg: '#03070E',
  primary: '#E50914', active: '#E50914', text: '#FFFFFF',
  textMuted: '#888888',
};

// ==========================================
// 1. MESIN EKSTRAKTOR (TERJEMAHAN KOTLIN -> JS)
// ==========================================
const extractVideoLink = async (tmdbId: string, isTv: boolean) => {
  // Terjemahan dari file Extractors.kt (Class Majorplay)
  try {
    const response = await fetch(`https://e2e.majorplay.net/api/token/viewer?videoId=${tmdbId}`, {
      headers: { "Origin": "https://e2e.majorplay.net", "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36" }
    });
    const data = await response.json();
    if (data.hlsUrl || data.primaryUrl) return data.hlsUrl || data.primaryUrl;
  } catch (error) {
    console.log("Ekstraktor Majorplay Gagal, coba fallback...", error);
  }
  // Jika gagal, gunakan fallback video tester (karena server bajakan sering ganti domain)
  return "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
};


// ==========================================
// 2. PEMUTAR VIDEO CUSTOM (GAYA NETFLIX/HBO)
// ==========================================
const CustomVideoPlayer = ({ videoUrl, title, visible, onClose }: { videoUrl: string | null, title: string, visible: boolean, onClose: () => void }) => {
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && !paused) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, paused]);

  if (!visible || !videoUrl) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose} supportedOrientations={['landscape']}>
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* MESIN EXOPLAYER */}
        <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFill} onPress={() => setShowControls(!showControls)}>
          <Video 
            source={{ uri: videoUrl }} 
            style={StyleSheet.absoluteFill} 
            paused={paused}
            resizeMode="contain" 
            onError={(e) => console.log("Video Error:", e)}
            bufferConfig={{ minBufferMs: 15000, maxBufferMs: 50000, bufferForPlaybackMs: 2500, bufferForPlaybackAfterRebufferMs: 5000 }}
          />
        </TouchableOpacity>

        {/* OVERLAY KONTROL GAYA NETFLIX */}
        {showControls && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'space-between' }]}>
            
            {/* Header: Tombol Back & Judul */}
            <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
              <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
                <Icon name="arrow-back" size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>{title}</Text>
            </SafeAreaView>

            {/* Tengah: Play/Pause Besar */}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => setPaused(!paused)} style={{ padding: 20 }}>
                <Icon name={paused ? "play" : "pause"} size={60} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Bawah: Progress Bar & Fitur Tambahan */}
            <SafeAreaView style={{ padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Text style={{ color: '#FFF', fontSize: 12 }}>00:00</Text>
                <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.3)', flex: 1, marginHorizontal: 15, borderRadius: 2 }}>
                  <View style={{ height: '100%', width: '30%', backgroundColor: THEME.primary, borderRadius: 2 }} />
                </View>
                <Text style={{ color: '#FFF', fontSize: 12 }}>Tontonan Langsung</Text>
              </View>
              <View style={{ flexDirection: 'row', marginLeft: 20 }}>
                <TouchableOpacity style={{ marginLeft: 20 }}><Icon name="chatbox-ellipses-outline" size={24} color="#FFF" /></TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 20 }}><Icon name="speedometer-outline" size={24} color="#FFF" /></TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        )}
      </View>
    </Modal>
  );
};


// ==========================================
// 3. LAYAR DETAIL FILM & REKOMENDASI
// ==========================================
const DetailMovieModal = ({ movieId, mediaType, visible, onClose, onMoviePress }: any) => {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videoUrlToPlay, setVideoUrlToPlay] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Sinopsis');
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  useEffect(() => {
    if (!movieId) return;
    const fetchDetail = async () => {
      setLoading(true);
      setActiveTab(mediaType === 'tv' ? 'Episode' : 'Sinopsis');
      try {
        const type = mediaType === 'tv' ? 'tv' : 'movie';
        // Sedot detail, aktor, dan SARAN VIDEO (Recommendations)
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}?api_key=${TMDB_API_KEY}&language=id-ID&append_to_response=credits,recommendations`);
        let data = await res.json();
        
        if (!data.overview) {
          const resEn = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`);
          const dataEn = await resEn.json();
          data.overview = dataEn.overview;
        }
        setDetail(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchDetail();
  }, [movieId, mediaType]);

  if (!visible || !movieId) return null;

  const handlePlay = async () => {
    setLoading(true);
    const link = await extractVideoLink(movieId, mediaType === 'tv');
    setVideoUrlToPlay(link);
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        
        <CustomVideoPlayer 
          videoUrl={videoUrlToPlay} 
          title={detail?.title || detail?.name} 
          visible={!!videoUrlToPlay} 
          onClose={() => setVideoUrlToPlay(null)} 
        />
        
        {loading && !detail ? (
          <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color={THEME.primary} /></View>
        ) : detail && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* BACKDROP */}
            <View>
              <Image source={{ uri: `https://image.tmdb.org/t/p/original${detail.backdrop_path || detail.poster_path}` }} style={{ width: '100%', height: 280 }} />
              <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 150, backgroundColor: 'rgba(5, 11, 20, 0.7)' }} />
              <SafeAreaView style={{ position: 'absolute', top: 10, left: 15 }}>
                <TouchableOpacity onPress={onClose} style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 30 }}>
                  <Icon name="close" size={28} color="#FFF" />
                </TouchableOpacity>
              </SafeAreaView>
            </View>

            {/* INFO UTAMA */}
            <View style={{ padding: 20, marginTop: -60 }}>
              <Text style={{ color: THEME.text, fontSize: 32, fontWeight: '900', marginBottom: 5 }}>{detail.title || detail.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: '#46D369', fontWeight: 'bold', marginRight: 10 }}>{detail.vote_average ? `${(detail.vote_average * 10).toFixed(0)}% Match` : 'Baru'}</Text>
                <Text style={{ color: '#BCBCBC', marginRight: 10 }}>{detail.release_date?.substring(0,4) || detail.first_air_date?.substring(0,4)}</Text>
                <Text style={{ color: '#BCBCBC', backgroundColor: '#333', paddingHorizontal: 5, borderRadius: 3, marginRight: 10 }}>18+</Text>
                <Text style={{ color: '#BCBCBC' }}>{mediaType === 'tv' ? `${detail.number_of_seasons} Season` : `${detail.runtime}m`}</Text>
              </View>

              {/* TOMBOL PLAY */}
              <TouchableOpacity style={{ backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 4, marginBottom: 15 }} onPress={handlePlay}>
                <Icon name="play" size={24} color="#000" style={{ marginRight: 8 }} />
                <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>Putar Sekarang</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{ backgroundColor: '#2A2A2A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 4, marginBottom: 25 }}>
                <Icon name="download-outline" size={24} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Unduh</Text>
              </TouchableOpacity>

              {/* TABS */}
              <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2A2A2A', marginBottom: 20 }}>
                {mediaType === 'tv' && (
                  <TouchableOpacity style={[styles.tabItem, activeTab === 'Episode' && styles.tabItemActive]} onPress={() => setActiveTab('Episode')}>
                    <Text style={[styles.tabText, activeTab === 'Episode' && styles.tabTextActive]}>EPISODE</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.tabItem, activeTab === 'Sinopsis' && styles.tabItemActive]} onPress={() => setActiveTab('Sinopsis')}>
                  <Text style={[styles.tabText, activeTab === 'Sinopsis' && styles.tabTextActive]}>SINOPSIS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabItem, activeTab === 'Pemeran' && styles.tabItemActive]} onPress={() => setActiveTab('Pemeran')}>
                  <Text style={[styles.tabText, activeTab === 'Pemeran' && styles.tabTextActive]}>PEMERAN</Text>
                </TouchableOpacity>
              </View>

              {/* KONTEN TAB */}
              {activeTab === 'Episode' && mediaType === 'tv' && (
                <View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                    {detail.seasons?.filter((s:any) => s.season_number > 0).map((season: any) => (
                      <TouchableOpacity key={season.id} style={[styles.seasonPill, selectedSeason === season.season_number && styles.seasonPillActive]} onPress={() => setSelectedSeason(season.season_number)}>
                        <Text style={[styles.seasonText, selectedSeason === season.season_number && styles.seasonTextActive]}>Season {season.season_number}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {Array.from({ length: detail.seasons?.find((s:any) => s.season_number === selectedSeason)?.episode_count || 0 }).map((_, index) => (
                    <TouchableOpacity key={index} style={styles.episodeCard} onPress={handlePlay}>
                      <View style={{ flex: 1 }}><Text style={{ color: THEME.text, fontSize: 16, fontWeight: 'bold' }}>Episode {index + 1}</Text><Text style={{ color: THEME.textMuted, fontSize: 12 }}>S{selectedSeason} : E{index + 1}</Text></View>
                      <Icon name="play-circle-outline" size={36} color="#FFF" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {activeTab === 'Sinopsis' && (
                <Text style={{ color: '#DDD', fontSize: 14, lineHeight: 22 }}>{detail.overview || "Sinopsis tidak tersedia."}</Text>
              )}

              {activeTab === 'Pemeran' && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {detail.credits?.cast?.slice(0, 15).map((actor: any) => (
                    <View key={actor.id} style={{ width: 80, alignItems: 'center', marginRight: 15 }}>
                      <Image source={{ uri: actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'https://via.placeholder.com/150' }} style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: THEME.cardBg, marginBottom: 8 }} />
                      <Text style={{ color: THEME.text, fontSize: 12, textAlign: 'center' }} numberOfLines={2}>{actor.name}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* REKOMENDASI (SARAN VIDEO) TERJEMAHAN KOTLIN */}
              <View style={{ marginTop: 30 }}>
                <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Lebih Banyak Seperti Ini</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {detail.recommendations?.results?.slice(0, 9).map((rec: any) => (
                    <TouchableOpacity key={rec.id} style={{ width: '31%', marginBottom: 15 }} onPress={() => onMoviePress(rec.id.toString(), rec.media_type || mediaType)}>
                      <Image source={{ uri: `https://image.tmdb.org/t/p/w200${rec.poster_path}` }} style={{ width: '100%', aspectRatio: 2/3, borderRadius: 4, backgroundColor: '#2A2A2A' }} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};


// ==========================================
// 4. BERANDA & NAVIGASI
// ==========================================
const MovieRow = ({ title, fetchUrl, type, onMoviePress }: any) => {
  const [movies, setMovies] = useState<any[]>([]);
  useEffect(() => { fetch(fetchUrl).then(r => r.json()).then(d => setMovies(d.results)).catch(e => console.error(e)); }, [fetchUrl]);
  if (movies.length === 0) return null;
  return (
    <View style={{ marginBottom: 25 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
        {movies.map(movie => (
          <TouchableOpacity key={movie.id} style={styles.movieCard} onPress={() => onMoviePress(movie.id.toString(), movie.media_type || type)}>
            <Image source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} style={styles.moviePoster} />
          </TouchableOpacity>
        ))}
        <View style={{ width: 30 }} />
      </ScrollView>
    </View>
  );
};

const BerandaScreen = () => {
  const [selectedMovie, setSelectedMovie] = useState<{id: string, type: string} | null>(null);
  const handlePress = (id: string, type: string) => setSelectedMovie({ id, type });

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <DetailMovieModal movieId={selectedMovie?.id || null} mediaType={selectedMovie?.type || 'movie'} visible={!!selectedMovie} onClose={() => setSelectedMovie(null)} onMoviePress={handlePress} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?q=80&w=1000&auto=format&fit=crop' }} style={[styles.banner, { marginHorizontal: 20, marginTop: 20, height: 400 }]} imageStyle={{ borderRadius: 12, opacity: 0.8 }}>
          <View style={{ position: 'absolute', bottom: 0, width: '100%', height: '50%', backgroundColor: 'rgba(5,11,20,0.8)', justifyContent: 'flex-end', padding: 20, borderRadius: 12 }}>
            <Text style={{ color: '#FFF', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 15 }}>SIARAN NASIONAL</Text>
            <TouchableOpacity style={{ backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 4 }}>
              <Icon name="play" size={20} color="#000" style={{ marginRight: 5 }} />
              <Text style={{ color: '#000', fontWeight: 'bold' }}>Putar</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <MovieRow title="Sedang Tren Sekarang" fetchUrl={`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}&language=id-ID`} type="movie" onMoviePress={handlePress} />
        <MovieRow title="Film Bioskop Populer" fetchUrl={`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=id-ID&sort_by=popularity.desc`} type="movie" onMoviePress={handlePress} />
        <MovieRow title="Seri TV Pilihan" fetchUrl={`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=id-ID&sort_by=popularity.desc`} type="tv" onMoviePress={handlePress} />
        <MovieRow title="Anime Terbaik" fetchUrl={`https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=id-ID&with_genres=16&with_original_language=ja`} type="tv" onMoviePress={handlePress} />
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const CariScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<{id: string, type: string} | null>(null);

  const searchMovies = async () => {
    if (!query) return;
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=id-ID&query=${query}`);
      const data = await response.json();
      setResults(data.results.filter((item:any) => item.media_type !== 'person'));
    } catch (e) { console.error(e); }
  };

  return (
    <View style={styles.screenContainer}>
      <DetailMovieModal movieId={selectedMovie?.id || null} mediaType={selectedMovie?.type || 'movie'} visible={!!selectedMovie} onClose={() => setSelectedMovie(null)} onMoviePress={(id: string, type: string) => setSelectedMovie({ id, type })} />
      <View style={{ flexDirection: 'row', marginBottom: 20, marginTop: 20 }}>
        <TextInput style={styles.searchInput} placeholder="Cari film, acara tv, anime..." placeholderTextColor="#888" value={query} onChangeText={setQuery} onSubmitEditing={searchMovies} />
        <TouchableOpacity style={styles.btnSearch} onPress={searchMovies}><Icon name="search" size={24} color="#FFF" /></TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {results.map((movie) => (
          <TouchableOpacity key={movie.id} style={{ flexDirection: 'row', backgroundColor: THEME.bg, marginBottom: 10 }} onPress={() => setSelectedMovie({ id: movie.id.toString(), type: movie.media_type || 'movie' })}>
            <Image source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path || movie.backdrop_path}` }} style={{ width: 120, height: 70, borderRadius: 4, backgroundColor: THEME.cardBg }} />
            <View style={{ flex: 1, paddingLeft: 15, justifyContent: 'center' }}>
              <Text style={{ color: THEME.text, fontSize: 16, fontWeight: 'bold' }}>{movie.title || movie.name}</Text>
            </View>
            <View style={{ justifyContent: 'center', paddingRight: 10 }}><Icon name="play-circle-outline" size={30} color="#FFF" /></View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const DummyScreen = () => (<View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}><Text style={{color: '#FFF'}}>Akan Datang</Text></View>);

const Tab = createBottomTabNavigator();
const MobileLayout = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
    <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
    <NavigationContainer>
      <Tab.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarStyle: { backgroundColor: 'rgba(5, 11, 20, 0.9)', borderTopWidth: 0, position: 'absolute', elevation: 0, height: 60, paddingBottom: 5 }, tabBarActiveTintColor: '#FFF', tabBarInactiveTintColor: THEME.textMuted, tabBarIcon: ({ color }) => { let iconName = 'home'; if (route.name === 'Cari') iconName = 'search-outline'; if (route.name === 'Unduhan') iconName = 'download-outline'; if (route.name === 'Lainnya') iconName = 'menu-outline'; return <Icon name={iconName} size={24} color={color} />; }, })}>
        <Tab.Screen name="Beranda" component={BerandaScreen} />
        <Tab.Screen name="Cari" component={CariScreen} />
        <Tab.Screen name="Unduhan" component={DummyScreen} />
        <Tab.Screen name="Lainnya" component={DummyScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  </SafeAreaView>
);

export default function App() { return <SafeAreaProvider><MobileLayout /></SafeAreaProvider>; }

const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 20 },
  banner: { justifyContent: 'center', marginBottom: 25, borderRadius: 12, overflow: 'hidden', backgroundColor: '#1A2230' },
  sectionTitle: { color: THEME.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 20 },
  movieCard: { width: 110, marginRight: 10 },
  moviePoster: { width: 110, height: 160, borderRadius: 4, backgroundColor: '#2A2A2A' },
  tabItem: { paddingBottom: 10, marginRight: 20 },
  tabItemActive: { borderBottomWidth: 3, borderBottomColor: THEME.primary },
  tabText: { color: THEME.textMuted, fontSize: 14, fontWeight: 'bold' },
  tabTextActive: { color: THEME.text },
  seasonPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 4, backgroundColor: '#2A2A2A', marginRight: 10 },
  seasonPillActive: { backgroundColor: THEME.text },
  seasonText: { color: THEME.text, fontWeight: 'bold' },
  seasonTextActive: { color: '#000' },
  episodeCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  searchInput: { flex: 1, backgroundColor: '#333', color: '#FFF', borderRadius: 4, paddingHorizontal: 15, height: 50 },
  btnSearch: { backgroundColor: '#333', width: 50, height: 50, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});
