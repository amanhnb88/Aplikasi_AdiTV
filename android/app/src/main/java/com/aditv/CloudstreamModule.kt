package com.aditv

import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import com.aditv.extractor.Adicinemax21Extractor // Pastikan folder/package ini sesuai dengan yang kita bahas sebelumnya

class CloudstreamModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "Cloudstream"
    }

    // --- FUNGSI BARU UNTUK MENGAMBIL VIDEO ---
    @ReactMethod
    fun getVideoLink(title: String, year: Int, isSeries: Boolean, season: Int, episode: Int, promise: Promise) {
        // Kita jalankan di background (Dispatchers.IO) agar UI tidak macet
        CoroutineScope(Dispatchers.IO).launch {
            try {
                var finalVideoUrl: String? = null
                
                // Di sini kita panggil mesin Adicinemax21Extractor (Contoh: pakai invokeIdlix)
                Adicinemax21Extractor.invokeIdlix(
                    title = title,
                    year = year,
                    season = if (isSeries) season else null,
                    episode = if (isSeries) episode else null,
                    subtitleCallback = { subtitle -> 
                        // (Opsional) Jika nanti butuh subtitle, bisa dikirim ke JS dari sini
                        Log.d("AdiTV_Subs", "Dapat subtitle: ${subtitle.url}")
                    },
                    callback = { extractorLink ->
                        // Kita ambil link video pertama yang berhasil didapatkan
                        if (finalVideoUrl == null && extractorLink.url.isNotEmpty()) {
                            finalVideoUrl = extractorLink.url
                        }
                    }
                )

                if (finalVideoUrl != null) {
                    // Berhasil! Kirim URL video ke React Native (JavaScript)
                    promise.resolve(finalVideoUrl)
                } else {
                    // Gagal, tidak nemu link
                    promise.reject("NOT_FOUND", "Video tidak ditemukan di server saat ini.")
                }

            } catch (e: Exception) {
                Log.e("AdiTV_Error", "Gagal mengambil video: ${e.message}")
                promise.reject("ERROR", "Terjadi kesalahan di mesin Kotlin: ${e.message}")
            }
        }
    }
    
    // ... (Kode loadPlugin yang sudah ada sebelumnya biarkan saja di sini) ...
}
