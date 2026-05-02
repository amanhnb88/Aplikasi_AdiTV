import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// --- KOMPONEN KONTEN HALAMAN (Dipakai di TV & HP) ---
const BerandaScreen = () => (
  <ScrollView style={styles.screenContainer}>
    {/* Banner Utama */}
    <View style={styles.banner}>
      <Text style={styles.bannerBadge}>LIVE</Text>
      <Text style={styles.bannerTitle}>Siaran Nasional</Text>
      <Text style={styles.bannerSubtitle}>Tonton siaran TV nasional favorit kapan saja, di mana saja.</Text>
      <TouchableOpacity style={styles.btnPrimary}>
        <Text style={styles.btnText}>▶ Tonton Sekarang</Text>
      </TouchableOpacity>
    </View>

    {/* Section Siaran Nasional */}
    <Text style={styles.sectionTitle}>Siaran Nasional</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
      <View style={styles.cardChannel}><Text style={styles.darkText}>TVRI</Text></View>
      <View style={styles.cardChannel}><Text style={styles.darkText}>RCTI</Text></View>
      <View style={styles.cardChannel}><Text style={styles.darkText}>MNCTV</Text></View>
      <View style={styles.cardChannel}><Text style={styles.darkText}>GTV</Text></View>
    </ScrollView>

    {/* Section Sedang Tayang */}
    <Text style={styles.sectionTitle}>Sedang Tayang</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
      <View style={styles.cardLive}><Text style={styles.whiteText}>TVRI Nasional</Text></View>
      <View style={styles.cardLive}><Text style={styles.whiteText}>RCTI</Text></View>
      <View style={styles.cardLive}><Text style={styles.whiteText}>MNCTV</Text></View>
    </ScrollView>
  </ScrollView>
);

const DummyScreen = ({ title }: { title: string }) => (
  <View style={[styles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
    <Text style={styles.whiteText}>Halaman {title}</Text>
  </View>
);

// --- 📺 LAYOUT KHUSUS ANDROID TV (SIDEBAR) ---
const TVLayout = () => {
  const [activeMenu, setActiveMenu] = useState('Home');
  const menus = ['Home', 'Live TV', 'Movies', 'Series', 'TV Guide'];

  return (
    <View style={styles.tvContainer}>
      {/* Sidebar Kiri */}
      <View style={styles.tvSidebar}>
        <View style={styles.tvLogoArea}>
          <Text style={styles.logoText}>ADITV</Text>
          <Text style={styles.subtitleText}>IPTV</Text>
        </View>

        {menus.map((menu) => (
          <TouchableOpacity 
            key={menu} 
            onPress={() => setActiveMenu(menu)}
            style={[styles.tvMenuItem, activeMenu === menu && styles.tvMenuItemActive]}
          >
            <Text style={[styles.tvMenuText, activeMenu === menu && styles.tvMenuTextActive]}>
              {menu}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Konten Kanan (Area Aman Overscan) */}
      <View style={styles.tvMainContent}>
        {activeMenu === 'Home' ? <BerandaScreen /> : <DummyScreen title={activeMenu} />}
      </View>
    </View>
  );
};

// --- 📱 LAYOUT KHUSUS MOBILE (BOTTOM TABS) ---
const Tab = createBottomTabNavigator();

const MobileLayout = () => (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#050B14' }}>
    <StatusBar barStyle="light-content" backgroundColor="#050B14" />
    {/* Header Mobile */}
    <View style={styles.mobileHeader}>
      <Text style={styles.logoText}>ADITV</Text>
    </View>

    {/* Navigasi Bawah Mobile */}
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#03070E', borderTopColor: '#1A2230', height: 60, paddingBottom: 10 },
          tabBarActiveTintColor: '#4A90E2',
          tabBarInactiveTintColor: '#888888',
        }}
      >
        <Tab.Screen name="Beranda" component={BerandaScreen} />
        <Tab.Screen name="Live TV" children={() => <DummyScreen title="Live TV" />} />
        <Tab.Screen name="Cari" children={() => <DummyScreen title="Cari" />} />
        <Tab.Screen name="Akun" children={() => <DummyScreen title="Akun" />} />
      </Tab.Navigator>
    </NavigationContainer>
  </SafeAreaView>
);

// --- 🚀 ROOT APP ---
export default function App() {
  return (
    <SafeAreaProvider>
      {Platform.isTV ? <TVLayout /> : <MobileLayout />}
    </SafeAreaProvider>
  );
}

// --- 🎨 GAYA DESAIN PREMIUM ---
const styles = StyleSheet.create({
  whiteText: { color: '#FFFFFF' },
  darkText: { color: '#000000', fontWeight: 'bold' },
  logoText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  subtitleText: { color: '#4A90E2', fontSize: 12, fontWeight: 'bold', marginBottom: 20 },
  
  // Konten Umum
  screenContainer: { flex: 1, backgroundColor: '#050B14', paddingHorizontal: 20 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  horizontalScroll: { paddingBottom: 10 },
  
  // Banner
  banner: { backgroundColor: '#111A2E', padding: 20, borderRadius: 12, marginTop: 10 },
  bannerBadge: { backgroundColor: '#E50914', color: '#FFF', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  bannerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  bannerSubtitle: { color: '#AAA', fontSize: 12, marginBottom: 15 },
  btnPrimary: { backgroundColor: '#2B52C3', alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#FFF', fontWeight: 'bold' },

  // Cards
  cardChannel: { backgroundColor: '#FFFFFF', width: 100, height: 80, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardLive: { backgroundColor: '#111A2E', width: 140, height: 100, borderRadius: 8, justifyContent: 'flex-end', padding: 10, marginRight: 15, borderColor: '#1A2230', borderWidth: 1 },

  // Layout TV
  tvContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#050B14' },
  tvSidebar: { width: 220, backgroundColor: '#03070E', paddingTop: 40, borderRightWidth: 1, borderColor: '#1A2230' },
  tvLogoArea: { paddingLeft: 30, marginBottom: 20 },
  tvMenuItem: { paddingVertical: 12, paddingLeft: 30, marginBottom: 5 },
  tvMenuItemActive: { backgroundColor: '#111A2E', borderLeftWidth: 4, borderLeftColor: '#4A90E2' },
  tvMenuText: { color: '#888888', fontSize: 16, fontWeight: '500' },
  tvMenuTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  tvMainContent: { flex: 1, padding: 30 },

  // Layout Mobile
  mobileHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#050B14' },
});
