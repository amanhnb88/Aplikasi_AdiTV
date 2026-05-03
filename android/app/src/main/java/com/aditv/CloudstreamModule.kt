[span_1](start_span)package com.aditv[span_1](end_span)

[span_2](start_span)import android.content.Context[span_2](end_span)
[span_3](start_span)import android.util.Log[span_3](end_span)
[span_4](start_span)import com.facebook.react.bridge.Promise[span_4](end_span)
[span_5](start_span)import com.facebook.react.bridge.ReactApplicationContext[span_5](end_span)
[span_6](start_span)import com.facebook.react.bridge.ReactContextBaseJavaModule[span_6](end_span)
[span_7](start_span)import com.facebook.react.bridge.ReactMethod[span_7](end_span)
[span_8](start_span)import dalvik.system.DexClassLoader[span_8](end_span)
[span_9](start_span)import java.io.File[span_9](end_span)
[span_10](start_span)import java.io.FileOutputStream[span_10](end_span)
[span_11](start_span)import java.net.HttpURLConnection[span_11](end_span)
[span_12](start_span)import java.net.URL[span_12](end_span)
[span_13](start_span)import kotlin.concurrent.thread[span_13](end_span)

// Tambahan import untuk fungsi bridge baru
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
[span_14](start_span)import com.aditv.extractor.Adicinemax21Extractor[span_14](end_span)

class CloudstreamModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        [span_15](start_span)return "Cloudstream"[span_15](end_span)
    }

    /**
     * FUNGSI 1: Load Plugin Dinamis (.cs3)
     * Digunakan untuk mendownload dan mengaktifkan plugin secara runtime.
     */
    @ReactMethod
    fun loadPlugin(pluginName: String, pluginUrl: String, promise: Promise) {
        [span_16](start_span)Log.d("Cloudstream", "Mulai proses download plugin: $pluginName")[span_16](end_span)
        
        thread {
            try {
                [span_17](start_span)val pluginDir = File(reactApplicationContext.filesDir, "plugins")[span_17](end_span)
                [span_18](start_span)if (!pluginDir.exists()) pluginDir.mkdirs()[span_18](end_span)
                
                [span_19](start_span)val outputFile = File(pluginDir, "$pluginName.cs3")[span_19](end_span)

                [span_20](start_span)val url = URL(pluginUrl)[span_20](end_span)
                [span_21](start_span)val connection = url.openConnection() as HttpURLConnection[span_21](end_span)
                [span_22](start_span)connection.requestMethod = "GET"[span_22](end_span)
                
                [span_23](start_span)// Menyamar sebagai Browser Chrome agar tidak diblokir GitHub[span_23](end_span)
                [span_24](start_span)connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")[span_24](end_span)
                [span_25](start_span)connection.connect()[span_25](end_span)

                if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                    [span_26](start_span)throw Exception("HTTP ${connection.responseCode} dari URL:\n$pluginUrl")[span_26](end_span)
                }

                [span_27](start_span)val inputStream = connection.inputStream[span_27](end_span)
                [span_28](start_span)val outputStream = FileOutputStream(outputFile)[span_28](end_span)
                [span_29](start_span)val buffer = ByteArray(1024)[span_29](end_span)
                var bytesRead: Int

                [span_30](start_span)while (inputStream.read(buffer).also { bytesRead = it } != -1) {[span_30](end_span)
                    [span_31](start_span)outputStream.write(buffer, 0, bytesRead)[span_31](end_span)
                }

                [span_32](start_span)outputStream.close()[span_32](end_span)
                [span_33](start_span)inputStream.close()[span_33](end_span)
                
                [span_34](start_span)// PROSES LOAD PLUGIN KOTLIN (.cs3 -> DexClassLoader)[span_34](end_span)
                [span_35](start_span)val optimizedDexOutputPath = reactApplicationContext.getDir("outdex", Context.MODE_PRIVATE)[span_35](end_span)
                
                [span_36](start_span)val dexClassLoader = DexClassLoader([span_36](end_span)
                    [span_37](start_span)outputFile.absolutePath,[span_37](end_span)
                    [span_38](start_span)optimizedDexOutputPath.absolutePath,[span_38](end_span)
                    [span_39](start_span)null,[span_39](end_span)
                    [span_40](start_span)reactApplicationContext.classLoader[span_40](end_span)
                )

                [span_41](start_span)promise.resolve("Plugin $pluginName berhasil didownload dan diaktifkan!")[span_41](end_span)

            } catch (e: Exception) {
                [span_42](start_span)Log.e("Cloudstream", "Error: ${e.message}")[span_42](end_span)
                [span_43](start_span)promise.reject("PLUGIN_ERROR", e.message, e)[span_43](end_span)
            }
        }
    }

    /**
     * FUNGSI 2: Bridge Pemanggil Video (Tonton Sekarang)
     * Menghubungkan UI React Native langsung ke mesin ekstraktor Adicinemax21.
     */
    @ReactMethod
    fun getVideoLink(title: String, year: Int, isSeries: Boolean, season: Int, episode: Int, promise: Promise) {
        // Menjalankan di latar belakang (IO Thread) agar UI tidak macet
        CoroutineScope(Dispatchers.IO).launch {
            try {
                var finalVideoUrl: String? = null
                
                [span_44](start_span)// Memanggil mesin ekstraktor utama[span_44](end_span)
                [span_45](start_span)Adicinemax21Extractor.invokeIdlix([span_45](end_span)
                    [span_46](start_span)title = title,[span_46](end_span)
                    [span_47](start_span)year = year,[span_47](end_span)
                    [span_48](start_span)season = if (isSeries) season else null,[span_48](end_span)
                    [span_49](start_span)episode = if (isSeries) episode else null,[span_49](end_span)
                    subtitleCallback = { subtitle -> 
                        // Log jika ada subtitle yang ditemukan
                        Log.d("AdiTV_Bridge", "Subtitle ditemukan: ${subtitle.url}")
                    },
                    callback = { extractorLink ->
                        // Ambil link video pertama yang valid
                        if (finalVideoUrl == null && extractorLink.url.isNotEmpty()) {
                            finalVideoUrl = extractorLink.url
                        }
                    }
                )

                if (finalVideoUrl != null) {
                    promise.resolve(finalVideoUrl)
                } else {
                    promise.reject("NOT_FOUND", "Maaf Bro, link video tidak ditemukan di server.")
                }

            } catch (e: Exception) {
                Log.e("AdiTV_Bridge", "Gagal mengambil video: ${e.message}")
                promise.reject("BRIDGE_ERROR", e.message, e)
            }
        }
    }
}
