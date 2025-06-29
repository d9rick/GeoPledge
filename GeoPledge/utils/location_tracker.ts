import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import api from "@/utils/api";

const TASK = "pledge-location-task";

// 1️⃣ background callback ----------------------------------------------------
TaskManager.defineTask(TASK, async ({ data, error }) => {
    if (error || !data) return;                 // bail on errors
    type TaskBody = { locations: Location.LocationObject[] };
    const { locations } = data as TaskBody;

    // pick the newest fix
    const fix = locations[locations.length - 1];
    try {
        await api.post("/api/pledges/check", {
            lat: fix.coords.latitude,
            lon: fix.coords.longitude,
            at: new Date().toISOString()
        });
    } catch { /* network errors are fine – will retry next fix */ }
});

// 2️⃣ helper to start / stop -------------------------------------------------
export async function startTracking() {
    // ask once for both foreground & background permission
    const fg = await Location.requestForegroundPermissionsAsync();
    const bg = await Location.requestBackgroundPermissionsAsync();
    if (fg.status !== "granted" || bg.status !== "granted") return false;

    // already running?  do nothing
    const running = await Location.hasStartedLocationUpdatesAsync(TASK);
    if (running) return true;

    // tune cadence – ≈ 5 min or when user moves ≥50 m
    await Location.startLocationUpdatesAsync(TASK, {
        accuracy: Location.Accuracy.High,          // GPS / fused
        timeInterval: 5 * 60 * 1000,               // ms
        distanceInterval: 50,                      // m
        showsBackgroundLocationIndicator: true,    // iOS blue bar
        foregroundService: {                       // Android 10+
            notificationTitle: "GeoPledge",
            notificationBody: "Tracking your pledge location"
        }
    });
    return true;
}

export async function stopTracking() {
    const running = await Location.hasStartedLocationUpdatesAsync(TASK);
    if (running) await Location.stopLocationUpdatesAsync(TASK);
}
