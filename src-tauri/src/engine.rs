use std::path::PathBuf;
use std::process::Command;

pub struct EngineService {
    engine_root: PathBuf,
    node_bin: String,
}

impl EngineService {
    pub fn new() -> Self {
        Self {
            engine_root: resolve_engine_root(),
            node_bin: resolve_node_bin(),
        }
    }

    pub fn run(
        &self,
        command: &str,
        args: &[String],
        vault_path: &str,
    ) -> Result<serde_json::Value, String> {
        let api_script = self.engine_root.join("graduates-guide-desktop-api.mjs");
        if !api_script.exists() {
            return Err(format!(
                "Engine not found at {}. Run npm install or link engine submodule.",
                api_script.display()
            ));
        }

        let mut cmd = Command::new(&self.node_bin);
        cmd.arg(&api_script);
        cmd.arg(command);
        for arg in args {
            cmd.arg(arg);
        }
        cmd.env("CAREER_OPS_VAULT", vault_path);
        cmd.current_dir(&self.engine_root);

        let output = cmd
            .output()
            .map_err(|e| format!("Failed to spawn node sidecar: {e}"))?;

        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();

        if stdout.is_empty() && !stderr.is_empty() {
            return Err(stderr);
        }

        let json: serde_json::Value =
            serde_json::from_str(&stdout).map_err(|e| format!("Invalid engine JSON: {e}\n{stdout}\n{stderr}"))?;

        if !output.status.success() {
            let err = json
                .get("error")
                .and_then(|v| v.as_str())
                .unwrap_or(&stderr);
            return Err(err.to_string());
        }

        Ok(json)
    }
}

fn resolve_engine_root() -> PathBuf {
    if let Ok(path) = std::env::var("GG_ENGINE_PATH") {
        return PathBuf::from(path);
    }

    if let Ok(cwd) = std::env::current_dir() {
        let dev_engine = cwd.join("engine");
        if dev_engine.join("graduates-guide-desktop-api.mjs").exists() {
            return dev_engine;
        }
        let parent_engine = cwd.parent().map(|p| p.join("engine"));
        if let Some(ref p) = parent_engine {
            if p.join("graduates-guide-desktop-api.mjs").exists() {
                return p.clone();
            }
        }
    }

    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            let bundled = dir.join("engine");
            if bundled.join("graduates-guide-desktop-api.mjs").exists() {
                return bundled;
            }
            let resources = dir.join("resources").join("engine");
            if resources.join("graduates-guide-desktop-api.mjs").exists() {
                return resources;
            }
        }
    }

    PathBuf::from("engine")
}

fn resolve_node_bin() -> String {
    if let Ok(path) = std::env::var("GG_NODE_PATH") {
        return path;
    }
    if cfg!(windows) {
        "node.exe".to_string()
    } else {
        "node".to_string()
    }
}
