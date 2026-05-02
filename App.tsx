import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator, Modal, TextInput, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video'; // <--- MESIN EXOPLAYER!

const TMDB_API_KEY = "b030404650f279792a8d3287232358e3"; 

const THEME = {
  bg: '#050B14', cardBg: '#111A2E', sidebarBg: '#03070E',
  primary: '#2B52C3', active: '#4A90E2', text: '#FFFFFF',
  textMuted: '#888888', red: '#E50914',
};

// --- 1. PEMUTAR VIDEO (EXOPLAYER NATIVE) ---
const VideoPlayerModal = ({ videoUrl, visible, onClose }: { videoUrl: string | null, visible: boolean, onClose: () => void }) => {
  if (!videoUrl) return null;
  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
        {/* Tombol Tutup */}
        <SafeAreaView style={{ position: 'absolute', top: 15, right: 20, zIndex: 10 }}>
          <TouchableOpacity onPress={onClose} style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 30 }}>
            <Icon name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        </SafeAreaView>
        
        {/* EXOPLAYER Asli dari react-native-video */}
        <Video 
          source={{ uri: videoUrl }} 
          style={StyleSheet.absoluteFill} // Bikin Fullscreen
          controls={true}                 // Memunculkan tombol play/pause bawaan ExoPlayer
          resizeMode="contain"            // Agar rasio video tidak peyang
          onError={(e) => console.log("Video Error:", e)}
          bufferConfig={{
            minBufferMs: 15000,
            maxBufferMs: 50000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000
          }}
        />
      </View>
    </Modal>
  );
};

// --- 2. LAYAR DETAIL FILM ---
const DetailMovieModal = ({ movieId, mediaType, visible, onClose }: { movieId: string | null, mediaType: string, visible: boolean, onClose: () => void }) => {
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
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}?api_key=${TMDB_API_KEY}&language=id-ID&append_to_response=credits,videos`);
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

  // SEMENTARA KITA PAKAI LINK .m3u8 DUMMY UNTUK TES EXOPLAYER
  // Nanti kita buat Extractor khusus untuk mencari link m3u8 asli filmnya
  const testM3u8Link = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"; 

  const handlePlayMovie = () => setVideoUrlToPlay(testM3u8Link);
  const handlePlayEpisode = (season: number, episode: number) => setVideoUrlToPlay(testM3u8Link);
  const handlePlayTrailer = () => setVideoUrlToPlay(testM3u8Link); // Youtube tidak bisa di ExoPlayer, ini buat tes saja

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <VideoPlayerModal videoUrl={videoUrlToPlay} visible={!!videoUrlToPlay} onClose={() => setVideoUrlToPlay(null)} />
        
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color={THEME.active} /></View>
        ) : detail && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* BACKDROP POSTER */}
            <View>
              <Image source={{ uri: `https://image.tmdb.org/t/p/original${detail.backdrop_path || detail.poster_path}` }} style={{ width: '100%', height: 250 }} />
              <SafeAreaView style={{ position: 'absolute', top: 10, left: 15 }}>
                <TouchableOpacity onPress={onClose} style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 30 }}>
                  <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
              </SafeAreaView>
            </View>

            {/* INFO UTAMA */}
            <View style={{ padding: 20 }}>
              <Text style={{ color: THEME.text, fontSize: 26, fontWeight: 'bold', marginBottom: 5 }}>{detail.title || detail.name}</Text>
              <Text style={{ color: '#00C853', fontSize: 14, fontWeight: 'bold', marginBottom: 15 }}>
                {detail.vote_average ? `${(detail.vote_average * 10).toFixed(0)}% Match` : 'New'} 
                <Text style={{ color: THEME.textMuted, fontWeight: 'normal' }}>  {detail.release_date?.substring(0,4) || detail.first_air_date?.substring(0,4)}  •  {mediaType === 'tv' ? `${detail.number_of_seasons} Season` : `${detail.runtime} Menit`}</Text>
              </Text>

              {/* TOMBOL PLAY (KHUSUS MOVIE) */}
              {mediaType !== 'tv' && (
                <TouchableOpacity style={[styles.btnPrimary, { justifyContent: 'center', marginBottom: 20 }]} onPress={handlePlayMovie}>
                  <Icon name="play" size={24} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnText}>Putar Film</Text>
                </TouchableOpacity>
              )}

              {/* TAB MENU */}
              <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1A2230', marginBottom: 20 }}>
                {mediaType === 'tv' && (
                  <TouchableOpacity style={[styles.tabItem, activeTab === 'Episode' && styles.tabItemActive]} onPress={() => setActiveTab('Episode')}>
                    <Text style={[styles.tabText, activeTab === 'Episode' && styles.tabTextActive]}>Episode</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.tabItem, activeTab === 'Sinopsis' && styles.tabItemActive]} onPress={() => setActiveTab('Sinopsis')}>
                  <Text style={[styles.tabText, activeTab === 'Sinopsis' && styles.tabTextActive]}>Sinopsis</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabItem, activeTab === 'Pemeran' && styles.tabItemActive]} onPress={() => setActiveTab('Pemeran')}>
                  <Text style={[styles.tabText, activeTab === 'Pemeran' && styles.tabTextActive]}>Pemeran</Text>
                </TouchableOpacity>
              </View>

              {/* KONTEN TAB: EPISODE (KHUSUS SERIES) */}
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
                    <TouchableOpacity key={index} style={styles.episodeCard} onPress={() => handlePlayEpisode(selectedSeason, index + 1)}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: THEME.text, fontSize: 16, fontWeight: 'bold' }}>Episode {index + 1}</Text>
                        <Text style={{ color: THEME.textMuted, fontSize: 12 }}>S{selectedSeason} : E{index + 1}</Text>
                      </View>
                      <Icon name="play-circle" size={36} color={THEME.text} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* KONTEN TAB: SINOPSIS */}
              {activeTab === 'Sinopsis' && (
                <View>
                  <Text style={{ color: '#DDD', fontSize: 14, lineHeight: 22 }}>
                    {detail.overview || "Maaf, sinopsis tidak tersedia untuk judul ini."}
                  </Text>
                  <Text style={{ color: THEME.textMuted, fontSize: 12, marginTop: 15 }}>Genre: {detail.genres?.map((g:any)=>g.name).join(', ')}</Text>
                </View>
              )}

              {/* KONTEN TAB: PEMERAN */}
              {activeTab === 'Pemeran' && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {detail.credits?.cast?.slice(0, 15).map((actor: any) => (
                    <View key={actor.id} style={{ width: '33%', alignItems: 'center', marginBottom: 20 }}>
                      <Image source={{ uri: actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'https://via.placeholder.com/150' }} style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: THEME.cardBg, marginBottom: 8 }} />
                      <Text style={{ color: THEME.text, fontSize: 12, textAlign: 'center' }} numberOfLines={1}>{actor.name}</Text>
                      <Text style={{ color: THEME.textMuted, fontSize: 10, textAlign: 'center' }} numberOfLines={1}>{actor.character}</Text>
                    </View>
                  ))}
                </View>
              )}

            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

// --- 3. KOMPONEN BARIS FILM (HORIZONTAL SCROLL) ---
const MovieRow = ({ title, fetchUrl, type, onMoviePress }: { title: string, fetchUrl: string, type: string, onMoviePress: (id: string, type: string) => void }) => {
  const [movies, setMovies] = useState<any[]>([]);
  useEffect(() => {
    fetch(fetchUrl).then(r => r.json()).then(d => setMovies(d.results)).catch(e => console.error(e));
  }, [fetchUrl]);

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

// --- 4. BERANDA ---
const BerandaScreen = ({ isTV }: { isTV?: boolean }) => {
  const [selectedMovie, setSelectedMovie] = useState<{id: string, type: string} | null>(null);

  const urlTrending = `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}&language=id-ID`;
  const urlMovies = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=id-ID&sort_by=popularity.desc`;
  const urlSeries = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=id-ID&sort_by=popularity.desc`;
  const urlAnime = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=id-ID&with_genres=16&with_original_language=ja`;
  const urlAsia = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=id-ID&with_original_language=ko|zh|th`;

  const handlePress = (id: string, type: string) => setSelectedMovie({ id, type });

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <DetailMovieModal movieId={selectedMovie?.id || null} mediaType={selectedMovie?.type || 'movie'} visible={!!selectedMovie} onClose={() => setSelectedMovie(null)} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?q=80&w=1000&auto=format&fit=crop' }} style={[styles.banner, { marginHorizontal: 20, marginTop: 20 }, isTV ? { height: 350 } : { height: 220 }]} imageStyle={{ borderRadius: 16, opacity: 0.6 }}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerBadge}>LIVE</Text>
            <Text style={styles.bannerTitle}>Siaran Nasional</Text>
            <TouchableOpacity style={[styles.btnPrimary, { alignSelf: 'flex-start' }]}>
              <Icon name="play" size={18} color="#FFF" style={{ marginRight: 5 }} />
              <Text style={styles.btnText}>Tonton Sekarang</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <MovieRow title="Sedang Tren Sekarang" fetchUrl={urlTrending} type="movie" onMoviePress={handlePress} />
        <MovieRow title="Film Bioskop Populer" fetchUrl={urlMovies} type="movie" onMoviePress={handlePress} />
        <MovieRow title="Seri TV Pilihan" fetchUrl={urlSeries} type="tv" onMoviePress={handlePress} />
        <MovieRow title="Anime Terbaik" fetchUrl={urlAnime} type="tv" onMoviePress={handlePress} />
        <MovieRow title="Drama Asia" fetchUrl={urlAsia} type="tv" onMoviePress={handlePress} />
        
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

// --- PENCARIAN FILM ---
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
      <DetailMovieModal movieId={selectedMovie?.id || null} mediaType={selectedMovie?.type || 'movie'} visible={!!selectedMovie} onClose={() => setSelectedMovie(null)} />
      
      <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>Pencarian</Text>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TextInput style={styles.searchInput} placeholder="Ketik judul..." placeholderTextColor="#888" value={query} onChangeText={setQuery} onSubmitEditing={searchMovies} />
        <TouchableOpacity style={styles.btnSearch} onPress={searchMovies}><Icon name="search" size={24} color="#FFF" /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {results.map((movie) => (
          <TouchableOpacity key={movie.id} style={styles.searchResultCard} onPress={() => setSelectedMovie({ id: movie.id.toString(), type: movie.media_type || 'movie' })}>
            <Image source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }} style={styles.searchThumb} />
            <View style={{ flex: 1, paddingLeft: 15 }}>
              <Text style={{ color: THEME.text, fontSize: 16, fontWeight: 'bold' }}>{movie.title || movie.name}</Text>
              <Text style={{ color: THEME.textMuted, fontSize: 12, marginTop: 5 }} numberOfLines={3}>{movie.overview}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const DummyScreen = ({ title }: { title: string }) => (<View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.bannerTitle}>{title}</Text></View>);
const TVLayout = () => { return <DummyScreen title="TV Layout" /> }; 

const Tab = createBottomTabNavigator();
const MobileLayout = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }}>
    <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
    <View style={styles.mobileHeader}><Text style={styles.logoText}>ADITV</Text></View>
    <NavigationContainer>
      <Tab.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarStyle: { backgroundColor: THEME.sidebarBg, borderTopColor: '#1A2230', height: 65, paddingBottom: 10, paddingTop: 10 }, tabBarActiveTintColor: THEME.active, tabBarInactiveTintColor: THEME.textMuted, tabBarIcon: ({ color }) => { let iconName = 'home'; if (route.name === 'Live TV') iconName = 'tv-outline'; if (route.name === 'Cari') iconName = 'search-outline'; if (route.name === 'Akun') iconName = 'person-outline'; return <Icon name={iconName} size={24} color={color} />; }, })}>
        <Tab.Screen name="Beranda" component={BerandaScreen} />
        <Tab.Screen name="Live TV" children={() => <DummyScreen title="Live TV" />} />
        <Tab.Screen name="Cari" component={CariScreen} />
        <Tab.Screen name="Akun" children={() => <DummyScreen title="Akun" />} />
      </Tab.Navigator>
    </NavigationContainer>
  </SafeAreaView>
);

export default function App() { return <SafeAreaProvider>{Platform.isTV ? <TVLayout /> : <MobileLayout />}</SafeAreaProvider>; }

// --- 🎨 STYLE ---
const styles = StyleSheet.create({
  logoText: { color: THEME.text, fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  screenContainer: { flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 20 },
  mobileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  
  banner: { justifyContent: 'center', marginBottom: 25, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1A2230' },
  bannerContent: { padding: 25, flex: 1, justifyContent: 'center' },
  bannerBadge: { backgroundColor: THEME.red, color: THEME.text, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 10, fontWeight: '900', marginBottom: 10 },
  bannerTitle: { color: THEME.text, fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  bannerSubtitle: { color: '#E0E0E0', fontSize: 14, marginBottom: 20 },
  btnPrimary: { backgroundColor: THEME.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: THEME.text, fontWeight: 'bold', fontSize: 16 },

  sectionTitle: { color: THEME.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 20 },
  movieCard: { width: 110, marginRight: 15 },
  moviePoster: { width: 110, height: 160, borderRadius: 8, backgroundColor: '#1A2230' },

  tabItem: { paddingBottom: 10, marginRight: 20 },
  tabItemActive: { borderBottomWidth: 3, borderBottomColor: THEME.red },
  tabText: { color: THEME.textMuted, fontSize: 16, fontWeight: '600' },
  tabTextActive: { color: THEME.text, fontWeight: 'bold' },

  seasonPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: THEME.cardBg, marginRight: 10 },
  seasonPillActive: { backgroundColor: '#E50914' },
  seasonText: { color: THEME.text, fontWeight: 'bold' },
  seasonTextActive: { color: '#FFF' },
  episodeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.cardBg, padding: 15, borderRadius: 12, marginBottom: 10, borderColor: '#1A2230', borderWidth: 1 },

  trailerCard: { width: '100%', height: 180, backgroundColor: THEME.cardBg, borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },

  searchInput: { flex: 1, backgroundColor: THEME.cardBg, color: '#FFF', borderRadius: 8, paddingHorizontal: 15, height: 50 },
  btnSearch: { backgroundColor: THEME.primary, width: 50, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  searchResultCard: { flexDirection: 'row', backgroundColor: THEME.cardBg, padding: 10, borderRadius: 12, marginBottom: 15 },
  searchThumb: { width: 60, height: 90, borderRadius: 8 },
});
