// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "linux")]
fn prepare_linux_env() {
    // WebKitGTK camera capture is unreliable under Wayland (PipeWire/portal);
    // X11 (via XWayland) is the reliable path. Only set it if the user hasn't
    // chosen a backend explicitly.
    if std::env::var_os("GDK_BACKEND").is_none() {
        // SAFETY: called before any GTK initialization, single-threaded.
        unsafe { std::env::set_var("GDK_BACKEND", "x11") };
    }

    // The AppImage bundles the GStreamer libraries but not the plugins, and the
    // bundled lib relocates its plugin path into the (empty) AppDir. Point
    // GStreamer at the system plugin directory so camera capture works.
    if std::env::var_os("GST_PLUGIN_PATH_1_0").is_none() {
        let candidates = [
            "/usr/lib/gstreamer-1.0",
            "/usr/lib/x86_64-linux-gnu/gstreamer-1.0",
            "/usr/lib64/gstreamer-1.0",
            "/usr/lib/aarch64-linux-gnu/gstreamer-1.0",
        ];
        let paths: Vec<&str> = candidates
            .into_iter()
            .filter(|p| std::path::Path::new(p).is_dir())
            .collect();

        if !paths.is_empty() {
            // SAFETY: called before GTK/GStreamer initialization, single-threaded.
            unsafe { std::env::set_var("GST_PLUGIN_PATH_1_0", paths.join(":")) };
        }
    }
}

fn main() {
    #[cfg(target_os = "linux")]
    prepare_linux_env();

    cube_game_lib::run()
}
