//! Linux/WebKitGTK: enable getUserMedia (camera/mic) in the webview.
//!
//! On macOS (WKWebView) and Windows (WebView2) media permissions are routed to
//! the OS automatically. On Linux, WebKitGTK needs two things or capture fails:
//!
//! * `enable-media-stream` is off by default, so `navigator.mediaDevices` never
//!   exposes a working `getUserMedia`;
//! * the default `permission-request` handler denies every request, so even with
//!   media-stream on the call rejects with `NotAllowedError`.
//!
//! This enables media-stream and installs a deny-by-default permission handler
//! that allows camera/mic only from trusted app origins.

/// Origins allowed to request media: the packaged app and the Vite dev server.
const ALLOWED_ORIGINS: [&str; 4] = [
    "tauri://localhost",
    "http://tauri.localhost",
    "http://localhost:1420",
    "http://127.0.0.1:1420",
];

#[cfg(target_os = "linux")]
pub fn enable_media_capture<R: tauri::Runtime>(webview: &tauri::Webview<R>) {
    use webkit2gtk::glib::prelude::Cast;
    use webkit2gtk::{
        PermissionRequestExt, SettingsExt, UserMediaPermissionRequest,
        UserMediaPermissionRequestExt, WebViewExt,
    };

    // `with_webview` runs the closure on the UI thread (GTK requirement).
    let _ = webview.with_webview(|platform_webview| {
        let webview = platform_webview.inner();

        if let Some(settings) = WebViewExt::settings(&webview) {
            settings.set_enable_media_stream(true);
            settings.set_enable_webrtc(true);
            settings.set_enable_mediasource(true);
        }

        webview.connect_permission_request(|wv, request| {
            // Only handle UserMedia requests; leave everything else to WebKit.
            let Some(req) = request.downcast_ref::<UserMediaPermissionRequest>() else {
                return false;
            };

            let uri = wv.uri().map(|u| u.to_string()).unwrap_or_default();
            let trusted = ALLOWED_ORIGINS.iter().any(|origin| uri.starts_with(origin));

            if trusted && (req.is_for_audio_device() || req.is_for_video_device()) {
                req.allow();
            } else {
                req.deny();
            }

            true
        });
    });
}

#[cfg(not(target_os = "linux"))]
pub fn enable_media_capture<R: tauri::Runtime>(_webview: &tauri::Webview<R>) {}
