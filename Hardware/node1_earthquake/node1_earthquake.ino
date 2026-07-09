/*
  SENTINEL / Q-RESCUE — NODE 1: EARTHQUAKE DETECTION
  Hardware: ESP32 + 0.96" OLED (SSD1306, I2C) + SW-420 Vibration Sensor

  LOGIC:
  - SW-420 outputs digital HIGH pulses when it detects shaking/vibration.
  - We count HIGH pulses in a rolling window to avoid single-spike false alarms.
  - If pulse count crosses SHAKE_THRESHOLD within WINDOW_MS -> RED (earthquake detected).
  - If no significant vibration for COOLDOWN_MS -> back to GREEN.

  FIREBASE PATH WRITTEN:
  /liveNodes/node1
      type       : "earthquake"
      status     : "red" | "green"
      vibration  : <pulse count in last window>
      timestamp  : <millis-based unix-ish timestamp, server can override with ServerValue.TIMESTAMP>

  LIBRARIES NEEDED (Install via Arduino Library Manager):
  - Firebase ESP32 Client   by Mobizt   ("Firebase_ESP_Client")
  - Adafruit SSD1306
  - Adafruit GFX Library
*/

#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// ---------------- USER CONFIG ----------------
#define WIFI_SSID        "Ragu"
#define WIFI_PASSWORD    "aar39kay"

// No https://, no trailing slash. e.g. "sentinel-qrescue-default-rtdb.asia-southeast1.firebasedatabase.app"
#define DATABASE_URL     "https://q-rescue-default-rtdb.asia-southeast1.firebasedatabase.app"

// From Firebase Console -> Project Settings -> Service Accounts -> Database secrets -> Show
#define DATABASE_SECRET  "Y4v34CFSWfEnohwo8u7z1RbaErkWmxFbGgPAGT98"
// ----------------------------------------------

// ---------------- PIN CONFIG ------------------
#define VIBRATION_PIN   14      // SW-420 digital OUT -> GPIO14
#define OLED_SDA        21
#define OLED_SCL        22
// ------------------------------------------------

#define SCREEN_WIDTH    128
#define SCREEN_HEIGHT   64
#define OLED_RESET      -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

FirebaseData   fbdo;
FirebaseAuth   auth;
FirebaseConfig config;

// ---------------- DETECTION LOGIC CONFIG --------
const unsigned long WINDOW_MS       = 1000;   // rolling window to count shakes
const unsigned long COOLDOWN_MS     = 4000;   // no vibration for this long -> reset to green
const int            SHAKE_THRESHOLD = 3;      // pulses within WINDOW_MS to trigger RED
// -------------------------------------------------

bool alertActive = false;
int  pulseCount = 0;
unsigned long windowStart = 0;
unsigned long lastVibrationTime = 0;
unsigned long lastFirebasePush = 0;
const unsigned long PUSH_INTERVAL_MS = 1000; // keepalive push interval

void setup() {
  Serial.begin(115200);
  pinMode(VIBRATION_PIN, INPUT);

  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED init failed");
  }
  display.clearDisplay();
  showStatus("BOOTING...", false);

  connectWiFi();
  setupFirebase();

  windowStart = millis();
  showStatus("SAFE", false);
}

void loop() {
  unsigned long now = millis();

  // Read vibration sensor
  int vib = digitalRead(VIBRATION_PIN);
  if (vib == HIGH) {
    pulseCount++;
    lastVibrationTime = now;
  }

  // Evaluate rolling window
  if (now - windowStart >= WINDOW_MS) {
    if (pulseCount >= SHAKE_THRESHOLD) {
      if (!alertActive) {
        alertActive = true;
        showStatus("EARTHQUAKE!", true);
        pushToFirebase(true, pulseCount);
      }
    }
    pulseCount = 0;
    windowStart = now;
  }

  // Auto-reset to green after cooldown with no vibration
  if (alertActive && (now - lastVibrationTime > COOLDOWN_MS)) {
    alertActive = false;
    showStatus("SAFE", false);
    pushToFirebase(false, 0);
  }

  // Keepalive push (so dashboard knows node is alive even with no state change)
  if (now - lastFirebasePush > PUSH_INTERVAL_MS) {
    pushToFirebase(alertActive, pulseCount);
    lastFirebasePush = now;
  }
}

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
}

void setupFirebase() {
  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void pushToFirebase(bool isAlert, int vibrationValue) {
  FirebaseJson json;
  json.set("type", "earthquake");
  json.set("status", isAlert ? "red" : "green");
  json.set("vibration", vibrationValue);
  json.set("timestamp", (int)(millis() / 1000));

  if (!Firebase.RTDB.setJSON(&fbdo, "/liveNodes/node1", &json)) {
    Serial.println("Firebase push failed: " + fbdo.errorReason());
  }
}

void showStatus(const char* msg, bool alert) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("NODE 1: EARTHQUAKE");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  display.setTextSize(2);
  display.setCursor(0, 25);
  display.println(msg);

  display.setTextSize(1);
  display.setCursor(0, 50);
  display.print("Pulses: ");
  display.println(pulseCount);

  display.display();
}
