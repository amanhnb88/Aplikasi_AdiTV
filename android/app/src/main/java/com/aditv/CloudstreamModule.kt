package com.aditv

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import dalvik.system.DexClassLoader
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class CloudstreamModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "Cloudstream"
    }

    @ReactMethod
    fun loadPlugin(pluginName: String, pluginUrl: String, promise: Promise) {
        Log.d("Cloudstream", "Mulai proses download plugin: $pluginName")
        
        // Kita jalankan di thread terpisah agar aplikasi tidak freeze/nge-hang saat download
        thread {
            try {
                // 1. Siapkan folder tujuan di memori internal aplikasi
                val pluginDir = File(reactApplicationContext.filesDir, "plugins")
                if (!pluginDir.exists()) pluginDir.mkdirs()
                
                val outputFile = File(pluginDir, "$pluginName.cs3")

                // 2. Proses Download File .cs3
                val url = URL(pluginUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connect()

                if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                    throw Exception("Server mengembalikan kode HTTP ${connection.responseCode}")
                }

                val inputStream = connection.inputStream
                val outputStream = FileOutputStream(outputFile)
                val buffer = ByteArray(1024)
                var bytesRead: Int

                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                    outputStream.write(buffer, 0, bytesRead)
                }

                outputStream.close()
                inputStream.close()
                Log.d("Cloudstream", "Download selesai: ${outputFile.absolutePath}")

                // 3. Proses "Ilmu Hitam" DexClassLoader untuk membaca .cs3
                // File .cs3 sebenarnya adalah file .apk/.zip yang berisi classes.dex
                val optimizedDexOutputPath = reactApplicationContext.getDir("outdex", Context.MODE_PRIVATE)
                
                val dexClassLoader = DexClassLoader(
                    outputFile.absolutePath,
                    optimizedDexOutputPath.absolutePath,
                    null,
                    reactApplicationContext.classLoader
                )

                // Jika sampai sini tidak error, berarti file .cs3 berhasil di-load ke dalam memori aplikasi!
                promise.resolve("Plugin $pluginName berhasil didownload dan di-load ke mesin Android!")

            } catch (e: Exception) {
                Log.e("Cloudstream", "Error: ${e.message}")
                promise.reject("PLUGIN_ERROR", "Gagal memproses plugin: ${e.message}", e)
            }
        }
    }
}
