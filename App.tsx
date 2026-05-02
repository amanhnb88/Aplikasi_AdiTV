import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator, NativeModules, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Memanggil jembatan Native Module Android (Kotlin)
const { Cloudstream } = NativeModules;

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

// --- KOMPONEN KONTEN UTAMA (Beranda) ---
const BerandaScreen = ({ isTV }: { isTV?: boolean }) => (
  <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
    
    {!isTV && (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {['Beranda', 'Live TV', 'Film', 'Series', 'Favorit'].map((cat, idx) => (
          <TouchableOpacity key={cat} style={[styles.categoryPill, idx === 0 && styles.categoryPillActive]}>
            <Text style={[styles.categoryText, idx === 0 && styles.categoryTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    )}

    {isTV && (
      <View style={styles.tvTopBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="search" size={24} color={THEME.textMuted} />
          <Text style={{ color: THEME.textMuted, fontSize: 18, marginLeft: 10 }}>Search</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ alignItems: 'flex-end', marginRight: 15 }}>
            <Text style={{ color: THEME.text, fontSize: 18, fontWeight: 'bold' }}>20:30</Text>
            <Text style={{ color: THEME.textMuted, fontSize: 12 }}>May 24, 2024</Text>
          </View>
          <Icon name="wifi" size={28} color={THEME.text} />
        </View>
      </View>
    )}

    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?q=80&w=1000&auto=format&fit=crop' }} 
      style={[styles.banner, isTV ? { height: 350 } : { height: 220 }]}
      imageStyle={{ borderRadius: 16, opacity: 0.6 }}
    >
      <View style={styles.bannerContent}>
        <Text style={styles.bannerBadge}>LIVE</Text>
        <Text style={[styles.bannerTitle, isTV && { fontSize: 36 }]}>Siaran Nasional</Text>
        <Text style={styles.bannerSubtitle}>Tonton siaran TV nasional favorit{'\n'}kapan saja, di mana saja.</Text>
        
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.btnPrimary}>
            <Icon name="play" size={18} color="#FFF" style={{ marginRight: 5 }} />
            <Text style={styles.btnText}>Tonton Sekarang</Text>
          </TouchableOpacity>
          {isTV && (
            <TouchableOpacity style={styles.btnSecondary}>
              <Icon name="grid-outline" size={18} color="#FFF" style={{ marginRight: 5 }} />
              <Text style={styles.btnText}>TV Guide</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ImageBackground>

    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Siaran Nasional</Text>
      <Text style={styles.seeAll}>Lihat Semua {'>'}</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
      {['TVRI', 'RCTI', 'MNCTV', 'GTV', 'iNews', 'ANTV'].map((ch) => (
        <View key={ch} style={styles.cardChannelWhite}>
          <Text style={styles.channelLogoText}>{ch}</Text>
        </View>
      ))}
    </ScrollView>

    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Sedang Tayang</Text>
      <Text style={styles.seeAll}>Lihat Semua {'>'}</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
      {['TVRI Nasional', 'RCTI', 'MNCTV', 'GTV'].map((ch) => (
        <View key={ch} style={styles.cardLive}>
          <Text style={styles.liveBadgeSmall}>LIVE</Text>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
             <Text style={{ color: THEME.primary, fontSize: 24, fontWeight: 'bold' }}>{ch.split(' ')[0]}</Text>
          </View>
          <Text style={styles.liveTitle}>{ch}</Text>
          <Text style={styles.liveTime}>19:00 - 21:30</Text>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
        </View>
      ))}
    </ScrollView>
    <View style={{ height: 50 }} />
  </ScrollView>
);

// --- KOMPONEN CLOUDSTREAM REPO ---
const CloudstreamScreen = () => {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk mengingat nama plugin yang sudah didownload
  const [downloadedPlugins, setDownloadedPlugins] = useState<string[]>([]);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/bikinveo-hash/RepairPremium_Repo/builds/plugins.json');
        const data = await response.json();
        setPlugins(data);
        setLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data plugin:", error);
        setLoading(false);
      }
    };
    fetchRepo();
  }, []);

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.sectionTitle}>Repositori Plugin Cloudstream</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={THEME.active} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
          {plugins.map((plugin, index) => {
            // Cek apakah plugin ini ada di dalam daftar "sudah didownload"
            const isDownloaded = downloadedPlugins.includes(plugin.name);

            return (
              <View key={index} style={styles.pluginCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pluginName}>{plugin.name}</Text>
                  <Text style={styles.pluginAuthor}>Oleh: {plugin.authors?.join(', ') || 'Anonim'}</Text>
                  <Text style={styles.pluginDesc}>{plugin.description}</Text>
                </View>
                
                {/* TOMBOL DINAMIS (DOWNLOAD / DELETE) */}
                <TouchableOpacity 
                  style={isDownloaded ? styles.btnDelete : styles.btnDownload}
                  onPress={async () => {
                    // JIKA SUDAH DIDOWNLOAD -> HAPUS
                    if (isDownloaded) {
                      setDownloadedPlugins(prev => prev.filter(p => p !== plugin.name));
                      Alert.alert("Dihapus", `Plugin ${plugin.name} telah dihapus/dinonaktifkan.`);
                      return;
                    }

                    // JIKA BELUM DIDOWNLOAD -> PROSES DOWNLOAD (KOTLIN)
                    try {
                      const fileName = plugin.url.split('/').pop(); 
                      const pluginUrl = `https://raw.githubusercontent.com/bikinveo-hash/RepairPremium_Repo/builds/${fileName}`;
                      
                      const responKotlin = await Cloudstream.loadPlugin(plugin.name, pluginUrl);
                      
                      // Masukkan nama plugin ke daftar ingatan (State)
                      setDownloadedPlugins(prev => [...prev, plugin.name]);
                      Alert.alert("Sukses!", responKotlin);
                    } catch (e: any) {
                      Alert.alert("Gagal Download", e.message || "Gagal menghubungkan ke Android");
                    }
                  }}
                >
                  {/* Ikon berubah dari Awan menjadi Tong Sampah */}
                  <Icon 
                    name={isDownloaded ? "trash-outline" : "cloud-download-outline"} 
                    size={22} 
                    color={isDownloaded ? "#FFFFFF" : "#FFFFFF"} 
                  />
                </TouchableOpacity>
              </View>
            );
          })}
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
    { name: 'Plugin', icon: 'extension-puzzle-outline' }, 
    { name: 'Movies', icon: 'film-outline' },
    { name: 'Series', icon: 'layers-outline' },
    { name: 'Favorites', icon: 'heart-outline' },
    { name: 'Settings', icon: 'settings-outline' },
  ];

  return (
    <View style={styles.tvContainer}>
      <View style={styles.tvSidebar}>
        <View style={styles.tvLogoArea}>
          <Text style={styles.logoText}>ADITV</Text>
          <Text style={styles.subtitleText}>IPTV</Text>
        </View>

        <ScrollView>
          {menus.map((m) => (
            <TouchableOpacity key={m.name} onPress={() => setActive(m.name)} style={[styles.tvMenuItem, active === m.name && styles.tvMenuItemActive]}>
              <Icon name={m.icon} size={22} color={active === m.name ? THEME.text : THEME.textMuted} style={{ marginRight: 15 }} />
              <Text style={[styles.tvMenuText, active === m.name && styles.tvMenuTextActive]}>{m.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.userProfile}>
          <Icon name="person-circle" size={40} color={THEME.textMuted} />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ color: THEME.text, fontSize: 14 }}>ADITV User</Text>
            <Text style={{ color: THEME.active, fontSize: 12 }}>Premium ♛</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {active === 'Home' ? <BerandaScreen isTV={true} /> : 
         active === 'Plugin' ? <CloudstreamScreen /> : 
         <DummyScreen title={active} />}
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
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity><Icon name="search" size={24} color={THEME.text} style={{ marginRight: 20 }} /></TouchableOpacity>
        <TouchableOpacity><Icon name="notifications-outline" size={24} color={THEME.text} /></TouchableOpacity>
      </View>
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
            if (route.name === 'Plugin') iconName = 'extension-puzzle-outline';
            if (route.name === 'Download') iconName = 'download-outline';
            if (route.name === 'Akun') iconName = 'person-outline';
            return <Icon name={iconName} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Beranda" component={BerandaScreen} />
        <Tab.Screen name="Live TV" children={() => <DummyScreen title="Live TV" />} />
        <Tab.Screen name="Plugin" component={CloudstreamScreen} />
        <Tab.Screen name="Download" children={() => <DummyScreen title="Download" />} />
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
  subtitleText: { color: THEME.active, fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginTop: -2 },
  
  screenContainer: { flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 20 },
  
  mobileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  categoryScroll: { maxHeight: 40, marginBottom: 15 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  categoryPillActive: { backgroundColor: THEME.primary },
  categoryText: { color: THEME.textMuted, fontSize: 14, fontWeight: '600' },
  categoryTextActive: { color: THEME.text },

  tvTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 30 },

  banner: { justifyContent: 'center', marginBottom: 25, borderRadius: 16, overflow: 'hidden', backgroundColor: '#1A2230' },
  bannerContent: { padding: 25, flex: 1, justifyContent: 'center' },
  bannerBadge: { backgroundColor: THEME.red, color: THEME.text, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 10, fontWeight: '900', marginBottom: 15 },
  bannerTitle: { color: THEME.text, fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  bannerSubtitle: { color: '#E0E0E0', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  btnPrimary: { backgroundColor: THEME.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginRight: 10 },
  btnSecondary: { backgroundColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: THEME.text, fontWeight: 'bold', fontSize: 14 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: THEME.text, fontSize: 18, fontWeight: 'bold' },
  seeAll: { color: THEME.textMuted, fontSize: 12 },
  horizontalScroll: { paddingBottom: 20 },

  cardChannelWhite: { backgroundColor: '#F0F0F0', width: 110, height: 80, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  channelLogoText: { color: '#000', fontSize: 22, fontWeight: '900', fontStyle: 'italic' },
  
  cardLive: { backgroundColor: THEME.cardBg, width: 150, height: 110, borderRadius: 12, padding: 12, marginRight: 15, borderColor: '#1A2230', borderWidth: 1 },
  liveBadgeSmall: { position: 'absolute', top: 8, left: 8, backgroundColor: THEME.red, color: THEME.text, fontSize: 8, fontWeight: 'bold', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3, zIndex: 1 },
  liveTitle: { color: THEME.text, fontSize: 12, fontWeight: 'bold' },
  liveTime: { color: THEME.textMuted, fontSize: 10, marginTop: 2, marginBottom: 8 },
  progressBarBg: { height: 3, backgroundColor: '#333', borderRadius: 2 },
  progressBarFill: { width: '60%', height: '100%', backgroundColor: THEME.active, borderRadius: 2 },

  pluginCard: { backgroundColor: THEME.cardBg, padding: 15, borderRadius: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderColor: '#1A2230', borderWidth: 1 },
  pluginName: { color: THEME.text, fontSize: 16, fontWeight: 'bold' },
  pluginAuthor: { color: THEME.active, fontSize: 12, marginTop: 2, marginBottom: 5 },
  pluginDesc: { color: THEME.textMuted, fontSize: 12, lineHeight: 18 },
  
  // Style Tombol Download (Awan biru)
  btnDownload: { backgroundColor: THEME.primary, padding: 12, borderRadius: 8, marginLeft: 15, width: 45, alignItems: 'center' },
  
  // Style Tombol Delete (Tong sampah transparan)
  btnDelete: { backgroundColor: 'transparent', padding: 12, borderRadius: 8, marginLeft: 15, width: 45, alignItems: 'center' },

  tvContainer: { flex: 1, flexDirection: 'row', backgroundColor: THEME.bg },
  tvSidebar: { width: 240, backgroundColor: THEME.sidebarBg, paddingTop: 40, borderRightWidth: 1, borderColor: '#1A2230' },
  tvLogoArea: { paddingLeft: 30, marginBottom: 40 },
  tvMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingLeft: 30, marginBottom: 5, borderRadius: 8, marginHorizontal: 10 },
  tvMenuItemActive: { backgroundColor: THEME.primary },
  tvMenuText: { color: THEME.textMuted, fontSize: 16, fontWeight: '600' },
  tvMenuTextActive: { color: THEME.text },
  userProfile: { flexDirection: 'row', alignItems: 'center', padding: 30, borderTopWidth: 1, borderColor: '#1A2230' },
});
