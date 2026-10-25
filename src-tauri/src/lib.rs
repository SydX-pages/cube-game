mod linux_media;

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Linux/WebKitGTK needs media-stream settings and a permission
            // handler for getUserMedia; no-op on macOS/Windows.
            #[cfg(target_os = "linux")]
            if let Some(webview) = app.get_webview_window("main") {
                linux_media::enable_media_capture(webview.as_ref());
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
