import React from 'react';
import { View, Text, Platform, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// 📺 KOMPONEN KHUSUS TV (Layout Kiri - Kanan)
const TVLayout = () => (
  <View style={styles.tvContainer}>
    {/* Sidebar Kiri (Persis seperti desainmu) */}
    <View style={styles.tvSidebar}>
      <Text style={styles.logoText}>ADITV</Text>
      <Text style={styles.subtitleText}>IPTV</Text>
      {/* Nanti menu-menu TV ditaruh di sini */}
    </View>

    {/* Konten Utama Kanan */}
    <View style={styles.mainContent}>
      <Text style={styles.whiteText}>Ini tampilan khusus TV.</Text>
      <Text style={styles.whiteText}>Aman dari potongan layar pinggir (overscan).</Text>
    </View>
  </View>
);

// 📱 KOMPONEN KHUSUS HP (Layout Atas - Bawah)
const MobileLayout = () => (
  // SafeAreaView akan otomatis melindungi area dari Notch/Kamera dan garis bawah iPhone/Android
  <SafeAreaView style={styles.mobileContainer}>
    <StatusBar barStyle="light-content" backgroundColor="#050B14" />
    
    {/* Header Atas */}
    <View style={styles.mobileHeader}>
      <Text style={styles.logoText}>ADITV</Text>
    </View>

    {/* Konten Utama Tengah */}
    <View style={styles.mainContent}>
      <Text style={styles.whiteText}>Ini tampilan khusus Mobile/HP.</Text>
      <Text style={styles.whiteText}>Aman dari jam, notch kamera, dan navbar bawah.</Text>
    </View>

    {/* Navbar Bawah */}
    <View style={styles.mobileBottomNav}>
      <Text style={styles.whiteText}>Menu Beranda | Live TV | Cari</Text>
    </View>
  </SafeAreaView>
);

// 🚀 KOMPONEN UTAMA (Deteksi Otomatis)
export default function App() {
  return (
    // SafeAreaProvider wajib ada untuk membungkus seluruh aplikasi
    <SafeAreaProvider>
      {/* Jika perangkat adalah TV, pakai TVLayout, jika bukan pakai MobileLayout */}
      {Platform.isTV ? <TVLayout /> : <MobileLayout />}
    </SafeAreaProvider>
  );
}

// 🎨 GAYA DESAIN (Warna disesuaikan dengan gambarmu)
const styles = StyleSheet.create({
  // --- Warna Dasar ---
  whiteText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitleText: {
    color: '#4A90E2', // Warna biru untuk tulisan IPTV
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050B14', // Warna gelap background utama
  },

  // --- Layout TV ---
  tvContainer: {
    flex: 1,
    flexDirection: 'row', // TV pakai layout menyamping (kiri ke kanan)
    backgroundColor: '#050B14',
  },
  tvSidebar: {
    width: 220,
    backgroundColor: '#03070E', // Warna sidebar sedikit lebih gelap
    paddingTop: 40,
    paddingLeft: 30,
    borderRightWidth: 1,
    borderColor: '#1A2230',
  },

  // --- Layout Mobile ---
  mobileContainer: {
    flex: 1,
    backgroundColor: '#050B14',
  },
  mobileHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#050B14',
  },
  mobileBottomNav: {
    height: 70,
    backgroundColor: '#03070E',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#1A2230',
  },
});
