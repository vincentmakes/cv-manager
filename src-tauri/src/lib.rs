use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use std::sync::Mutex;
use std::time::Duration;

/// State to hold the sidecar child process so we can kill it on exit.
struct SidecarState {
    child: Mutex<Option<tauri_plugin_shell::process::CommandChild>>,
}

/// Find an available port by binding to port 0.
fn find_available_port() -> u16 {
    let listener = std::net::TcpListener::bind("127.0.0.1:0").expect("Failed to find available port");
    listener.local_addr().unwrap().port()
}

/// Wait for the Express server to be ready by polling the health endpoint.
fn wait_for_server(port: u16, timeout: Duration) -> bool {
    let start = std::time::Instant::now();
    let url = format!("http://127.0.0.1:{}/api/profile", port);

    while start.elapsed() < timeout {
        if let Ok(response) = ureq::get(&url).call() {
            if response.status() == 200 {
                return true;
            }
        }
        std::thread::sleep(Duration::from_millis(250));
    }
    false
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let port = find_available_port();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarState {
            child: Mutex::new(None),
        })
        .setup(move |app| {
            let app_data_dir = app.path().app_data_dir().expect("Failed to get app data dir");

            // Ensure the data directory exists
            std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");

            let db_path = app_data_dir.join("cv.db");
            let uploads_dir = app_data_dir.join("uploads");
            std::fs::create_dir_all(&uploads_dir).expect("Failed to create uploads directory");

            // Spawn the Express server sidecar
            let shell = app.shell();
            let sidecar_command = shell
                .sidecar("cv-manager-server")
                .expect("Failed to create sidecar command")
                .env("PORT", port.to_string())
                .env("DB_PATH", db_path.to_string_lossy().to_string())
                .env("UPLOAD_DIR", uploads_dir.to_string_lossy().to_string())
                .env("HOST", "127.0.0.1")
                .env("NODE_ENV", "production")
                // Disable the public server in desktop mode — admin UI only
                .env("PUBLIC_ONLY", "false")
                .env("PUBLIC_PORT", "0");

            let (mut rx, child) = sidecar_command.spawn().expect("Failed to spawn sidecar");

            // Store child process for cleanup
            let state = app.state::<SidecarState>();
            *state.child.lock().unwrap() = Some(child);

            // Log sidecar output in a background thread
            let port_for_log = port;
            tauri::async_runtime::spawn(async move {
                use tauri_plugin_shell::process::CommandEvent;
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            eprintln!("[sidecar:stdout] {}", String::from_utf8_lossy(&line));
                        }
                        CommandEvent::Stderr(line) => {
                            eprintln!("[sidecar:stderr] {}", String::from_utf8_lossy(&line));
                        }
                        CommandEvent::Terminated(payload) => {
                            eprintln!(
                                "[sidecar] Process terminated with code: {:?}, signal: {:?}",
                                payload.code, payload.signal
                            );
                            break;
                        }
                        _ => {}
                    }
                }
                eprintln!("[sidecar] Event loop ended for port {}", port_for_log);
            });

            // Wait for Express server to be ready
            eprintln!("Waiting for Express server on port {}...", port);
            if !wait_for_server(port, Duration::from_secs(15)) {
                eprintln!("WARNING: Express server did not become ready within 15 seconds");
            } else {
                eprintln!("Express server ready on port {}", port);
            }

            // Navigate the main window to the Express admin UI
            let main_window = app.get_webview_window("main").expect("Failed to get main window");
            let url = format!("http://127.0.0.1:{}", port);
            main_window
                .navigate(url.parse().unwrap())
                .expect("Failed to navigate to admin UI");

            Ok(())
        })
        .on_window_event(|window, event| {
            // Kill sidecar when the app window is closed
            if let tauri::WindowEvent::Destroyed = event {
                let state = window.state::<SidecarState>();
                let child = state.child.lock().unwrap().take();
                if let Some(child) = child {
                    let _ = child.kill();
                    eprintln!("[sidecar] Process killed on window close");
                };
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
