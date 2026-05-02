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
        
        thread {
            try {
                val pluginDir = File(reactApplicationContext.filesDir, "plugins")
                if (!pluginDir.exists()) pluginDir.mkdirs()
                
                val outputFile = File(pluginDir, "$pluginName.cs3")

                val url = URL(pluginUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                
                // ILMU HITAM 2: Menyamar sebagai Browser Chrome agar tidak diblokir GitHub!
                connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                connection.connect()

                if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                    // Jika error, tampilkan URL-nya sekalian di layar HP
                    throw Exception("HTTP ${connection.responseCode} dari URL:\n$pluginUrl")
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
                
                // --- PROSES LOAD PLUGIN KOTLIN (.cs3 -> DexClassLoader) ---
                val optimizedDexOutputPath = reactApplicationContext.getDir("outdex", Context.MODE_PRIVATE)
                
                val dexClassLoader = DexClassLoader(
                    outputFile.absolutePath,
                    optimizedDexOutputPath.absolutePath,
                    null,
                    reactApplicationContext.classLoader
                )

                // Jika sukses, laporkan kembali ke JavaScript!
                promise.resolve("Plugin $pluginName berhasil didownload dan diaktifkan!")

            } catch (e: Exception) {
                Log.e("Cloudstream", "Error: ${e.message}")
                promise.reject("PLUGIN_ERROR", e.message, e)
            }
        }
    }
}
