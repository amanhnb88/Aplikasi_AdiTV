// File: src/screens/MediaDetailScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const isTV = Platform.isTV || width > 800; // Deteksi apakah ini di TV/Layar Lebar

const THEME = {
  bg: '#050B14',
  primaryBtn: '#0055FF', // Biru terang seperti di screenshot
  secondaryBtn: '#1A2230',
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
};

export default function MediaDetailScreen({ media, type = 'movie', onClose }) {
  const [activeSeason, setActiveSeason] = useState(1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={isTV ? styles.tvLayout : styles.mobileLayout}>
      
      {/* TOMBOL KEMBALI */}
      <TouchableOpacity style={styles.backBtn} onPress={onClose}>
        <Icon name="arrow-back" size={28} color={THEME.text} />
        {isTV && <Text style={styles.backText}>{type === 'movie' ? 'Movies / Detail' : 'Series / Detail'}</Text>}
      </TouchableOpacity>

      {/* BAGIAN ATAS: POSTER & INFO */}
      <View style={isTV ? styles.topSectionTV : styles.topSectionMobile}>
        
        {/* POSTER */}
        <Image 
          source={{ uri: media.poster_path }} 
          style={isTV ? styles.posterTV : styles.posterMobile} 
          resizeMode="cover"
        />

        {/* INFO KANAN (TV) / BAWAH POSTER (MOBILE) */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{media.title}</Text>
          
          {/* Metadata Bar (Bintang, Tahun, Durasi, Umur) */}
          <View style={styles.metaRow}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.metaText}> {media.rating}</Text>
            <Text style={styles.metaText}>  {media.year}</Text>
            <Text style={styles.metaText}>  {media.duration}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{media.age}</Text></View>
            <Text style={styles.metaText}>  {media.genres}</Text>
          </View>

          {/* Kualitas Resolusi */}
          <View style={styles.qualityRow}>
            <View style={styles.badgeDark}><Text style={styles.badgeText}>HD</Text></View>
            <View style={styles.badgeDark}><Text style={styles.badgeText}>1080p</Text></View>
            <View style={styles.badgeDark}><Text style={styles.badgeText}>5.1</Text></View>
            <Text style={styles.metaText}> English</Text>
          </View>

          {/* Sinopsis */}
          <Text style={styles.synopsis}>{media.synopsis}</Text>

          {/* Tabel Info (Sutradara, Pemeran, dll) */}
          <View style={styles.creditsTable}>
            {media.director && <Text style={styles.creditLine}><Text style={styles.creditLabel}>Sutradara:  </Text>{media.director}</Text>}
            <Text style={styles.creditLine}><Text style={styles.creditLabel}>Pemeran:   </Text>{media.cast}</Text>
            <Text style={styles.creditLine}><Text style={styles.creditLabel}>Subtitle:  </Text>Indonesia, English</Text>
          </View>

          {/* BARISAN TOMBOL AKSI */}
          <View style={isTV ? styles.actionRowTV : styles.actionRowMobile}>
            <TouchableOpacity style={styles.btnPrimary}>
              <Icon name="play" size={20} color="#FFF" />
              <Text style={styles.btnPrimaryText}>Tonton Sekarang</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActionContainer}>
              <TouchableOpacity style={styles.btnSecondary}>
                <Icon name="add" size={20} color="#FFF" />
                <Text style={styles.btnSecondaryText}>{isTV ? "Tambah ke Favorit" : "Favorit"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSecondary}>
                <Icon name="film-outline" size={20} color="#FFF" />
                <Text style={styles.btnSecondaryText}>Trailer</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>

      {/* KHUSUS SERIES: TAB SEASON & LIST EPISODE */}
      {type === 'series' && (
        <View style={styles.episodesSection}>
          <Text style={styles.sectionTitle}>Season</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonScroll}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity 
                key={s} 
                style={[styles.seasonBadge, activeSeason === s && styles.seasonBadgeActive]}
                onPress={() => setActiveSeason(s)}
              >
                <Text style={[styles.seasonBadgeText, activeSeason === s && styles.seasonBadgeTextActive]}>
                  Season {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* List Episode (Contoh Dummy) */}
          {[1, 2, 3].map((ep) => (
            <TouchableOpacity key={ep} style={styles.episodeCard}>
              <View style={styles.episodeThumbContainer}>
                <Image source={{ uri: media.poster_path }} style={styles.episodeThumb} />
                <Icon name="play-circle-outline" size={30} color="#FFF" style={styles.episodePlayIcon} />
              </View>
              <View style={styles.episodeInfo}>
                <Text style={styles.episodeTitle}>{ep}. Nama Episode</Text>
                <Text style={styles.episodeDesc} numberOfLines={2}>Deskripsi singkat episode ini menjelaskan tentang alur cerita...</Text>
              </View>
              <Text style={styles.episodeDuration}>48m</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  tvLayout: { padding: 40, paddingLeft: 100 }, // Memberi ruang untuk sidebar di TV
  mobileLayout: { padding: 20, paddingTop: 40 },
  
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { color: THEME.text, fontSize: 18, marginLeft: 10, fontWeight: 'bold' },

  topSectionTV: { flexDirection: 'row' },
  topSectionMobile: { flexDirection: 'column' },
  
  posterTV: { width: 300, height: 450, borderRadius: 12, marginRight: 40 },
  posterMobile: { width: 140, height: 210, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 20 },
  
  infoSection: { flex: 1 },
  title: { color: THEME.text, fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 },
  metaText: { color: THEME.textMuted, fontSize: 14 },
  badge: { borderWidth: 1, borderColor: THEME.textMuted, paddingHorizontal: 6, borderRadius: 4, marginLeft: 10 },
  badgeDark: { backgroundColor: '#222', paddingHorizontal: 6, borderRadius: 4, marginRight: 10, paddingVertical: 2 },
  badgeText: { color: THEME.textMuted, fontSize: 12, fontWeight: 'bold' },
  
  qualityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  synopsis: { color: '#E0E0E0', fontSize: 15, lineHeight: 24, marginBottom: 20 },
  
  creditsTable: { marginBottom: 30 },
  creditLine: { color: THEME.text, fontSize: 14, marginBottom: 5 },
  creditLabel: { color: THEME.textMuted, width: 80 },

  // LOGIKA TOMBOL
  actionRowTV: { flexDirection: 'row', alignItems: 'center' },
  actionRowMobile: { flexDirection: 'column' },
  
  btnPrimary: { backgroundColor: THEME.primaryBtn, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 8, marginBottom: isTV ? 0 : 15, marginRight: isTV ? 15 : 0 },
  btnPrimaryText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  
  secondaryActionContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSecondary: { backgroundColor: THEME.secondaryBtn, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, flex: isTV ? 0 : 1, marginRight: isTV ? 15 : 5, marginLeft: isTV ? 0 : 5 },
  btnSecondaryText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },

  // SERIES STYLE
  episodesSection: { marginTop: 40 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  seasonScroll: { marginBottom: 20 },
  seasonBadge: { backgroundColor: THEME.secondaryBtn, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  seasonBadgeActive: { backgroundColor: THEME.primaryBtn },
  seasonBadgeText: { color: THEME.textMuted, fontWeight: 'bold' },
  seasonBadgeTextActive: { color: '#FFF' },
  
  episodeCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  episodeThumbContainer: { position: 'relative' },
  episodeThumb: { width: 120, height: 70, borderRadius: 8, backgroundColor: '#222' },
  episodePlayIcon: { position: 'absolute', top: 20, left: 45 },
  episodeInfo: { flex: 1, paddingHorizontal: 15 },
  episodeTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  episodeDesc: { color: THEME.textMuted, fontSize: 13 },
  episodeDuration: { color: THEME.textMuted, fontSize: 14 },
});
