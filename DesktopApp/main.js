const { app, BrowserWindow, dialog, Menu } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");
const http = require("node:http");
const fs = require("node:fs");

let backendProcess = null;

const BACKEND_PORT = 18080;
const JAR_NAME = "Backend-0.0.1-SNAPSHOT.jar";

function normalizePathForH2(filePath) {
  return filePath.replace(/\\/g, "/");
}

function getProjectRoot() {
  return path.join(__dirname, "..");
}

function getBackendPathDev() {
  return path.join(getProjectRoot(), "Backend");
}

function getBackendJarPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend", JAR_NAME);
  }

  return path.join(getBackendPathDev(), "target", JAR_NAME);
}

function getBackendWorkingDirectory() {
  if (app.isPackaged) {
    return app.getPath("userData");
  }

  return getBackendPathDev();
}

function getDatabaseBasePath() {
  if (app.isPackaged) {
    return path.join(app.getPath("userData"), "data", "anime_tracker_db");
  }

  return path.join(getBackendPathDev(), "data", "anime_tracker_db");
}

function getAppIconPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "icon.ico");
  }

  return path.join(__dirname, "build", "icon.ico");
}

function copyInitialDatabaseIfNeeded() {
  if (!app.isPackaged) {
    return;
  }

  const userDataFolder = path.join(app.getPath("userData"), "data");
  const userDatabaseFile = path.join(userDataFolder, "anime_tracker_db.mv.db");

  if (fs.existsSync(userDatabaseFile)) {
    return;
  }

  const bundledDataFolder = path.join(process.resourcesPath, "backend", "data");

  if (!fs.existsSync(bundledDataFolder)) {
    fs.mkdirSync(userDataFolder, { recursive: true });
    return;
  }

  fs.mkdirSync(userDataFolder, { recursive: true });

  fs.cpSync(bundledDataFolder, userDataFolder, {
    recursive: true,
    force: true
  });
}

function waitForBackend(timeoutMs = 30000) {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkServer = () => {
      const request = http.get(
        `http://localhost:${BACKEND_PORT}/api/animes`,
        (response) => {
          response.resume();

          if (response.statusCode >= 200 && response.statusCode < 500) {
            resolve();
            return;
          }

          retry();
        }
      );

      request.on("error", retry);

      request.setTimeout(1000, () => {
        request.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error("Spring Boot backend did not start in time."));
        return;
      }

      setTimeout(checkServer, 500);
    };

    checkServer();
  });
}

function startBackend() {
  const jarPath = getBackendJarPath();
  const workingDirectory = getBackendWorkingDirectory();
  const databaseBasePath = normalizePathForH2(getDatabaseBasePath());

  if (!fs.existsSync(jarPath)) {
    dialog.showErrorBox(
      "Backend not found",
      `The backend JAR was not found:\n\n${jarPath}\n\nRun .\\mvnw.cmd clean package -DskipTests inside the Backend folder.`
    );

    app.quit();
    return;
  }

  copyInitialDatabaseIfNeeded();

  backendProcess = spawn(
    "java",
    [
      "-jar",
      jarPath,
      `--server.port=${BACKEND_PORT}`,
      `--spring.datasource.url=jdbc:h2:file:${databaseBasePath};AUTO_SERVER=TRUE`
    ],
    {
      cwd: workingDirectory,
      windowsHide: true
    }
  );

  backendProcess.stdout.on("data", (data) => {
    console.log(`[Spring Boot] ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`[Spring Boot Error] ${data}`);
  });

  backendProcess.on("error", (error) => {
    dialog.showErrorBox(
      "Java not found",
      `Could not start the Spring Boot backend.\n\n${error.message}\n\nCheck that Java is installed and available in PATH.`
    );

    app.quit();
  });

  backendProcess.on("exit", (code) => {
    console.log(`Spring Boot backend exited with code ${code}`);
  });
}

function createWindow() {
  const iconPath = getAppIconPath();

  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 1000,
    minHeight: 700,
    title: "Anime Tracker",
    icon: iconPath,
    backgroundColor: "#111114",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(`http://localhost:${BACKEND_PORT}`);
}

app.whenReady().then(async () => {
  try {
    app.setAppUserModelId("com.animetracker.desktop");

    Menu.setApplicationMenu(null);

    startBackend();
    await waitForBackend();
    createWindow();
  } catch (error) {
    dialog.showErrorBox(
      "Startup error",
      `Anime Tracker could not start correctly.\n\n${error.message}`
    );

    app.quit();
  }
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
});

app.on("window-all-closed", () => {
  app.quit();
});