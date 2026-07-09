/*
  SENTINEL / Q-RESCUE — NODE 2: FLOOD / TSUNAMI DETECTION
  Hardware: ESP32 + 0.96" OLED (SSD1306, I2C) + DHT11 Temp/Humidity Sensor

  LOGIC:
  - DHT11 reads humidity every READ_INTERVAL_MS.
  - If humidity >= HUMIDITY_THRESHOLD (70%) sustained for CONFIRM_COUNT
    consecutive readings -> RED (flood detected). Debounce avoids one noisy
    reading flipping the state.
  - If humidity drops back below threshold for CONFIRM_COUNT readings -> GREEN.

  FIREBASE PATH WRITTEN:
  /liveNodes/node2
      type        : "flood"
      status      : "red" | "green"
      humidity    : <float, %>
      temperature : <float, C>
      timestamp   : <seconds since boot>

  LIBRARIES NEEDED:
  - Firebase ESP32 Client   by Mobizt
  - Adafruit SSD1306, Adafruit GFX
  - DHT sensor library      by Adafruit  (+ Adafruit Unified Sensor dependency)
*/

#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
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

// ---------------- PIN CONFIG ------------------
#define DHT_PIN         27
#define DHT_TYPE        DHT11
#define OLED_SDA        21
#define OLED_SCL        22
// ------------------------------------------------

DHT dht(DHT_PIN, DHT_TYPE);

#define SCREEN_WIDTH    128
#define SCREEN_HEIGHT   64
#define OLED_RESET      -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

FirebaseData   fbdo;
FirebaseAuth   auth;
FirebaseConfig config;

// ---------------- DETECTION LOGIC CONFIG --------
const float          HUMIDITY_THRESHOLD = 70.0;  // % RH
const int            CONFIRM_COUNT      = 3;      // consecutive readings needed to flip state
const unsigned long  READ_INTERVAL_MS   = 2000;   // DHT11 max ~1 reading/sec, use 2s to be safe
// -------------------------------------------------

bool alertActive = false;
int  aboveCount = 0;
int  belowCount = 0;
float lastHumidity = 0;
float lastTemp = 0;
unsigned long lastReadTime = 0;
unsigned long lastFirebasePush = 0;
const unsigned long PUSH_INTERVAL_MS = 1000;

void setup() {
  Serial.begin(115200);
  dht.begin();

  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED init failed");
  }
  display.clearDisplay();
  showStatus("BOOTING...");

  connectWiFi();
  setupFirebase();

  showStatus("SAFE");
}

void loop() {
  unsigned long now = millis();

  if (now - lastReadTime >= READ_INTERVAL_MS) {
    lastReadTime = now;
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (!isnan(h) && !isnan(t)) {
      lastHumidity = h;
      lastTemp = t;

      if (h >= HUMIDITY_THRESHOLD) {
        aboveCount++;
        belowCount = 0;
      } else {
        belowCount++;
        aboveCount = 0;
      }

      if (!alertActive && aboveCount >= CONFIRM_COUNT) {
        alertActive = true;
        showStatus("FLOOD DETECTED!");
        pushToFirebase();
      } else if (alertActive && belowCount >= CONFIRM_COUNT) {
        alertActive = false;
        showStatus("SAFE");
        pushToFirebase();
      } else {
        showStatus(alertActive ? "FLOOD DETECTED!" : "SAFE");
      }
    } else {
      Serial.println("DHT11 read failed");
    }
  }

  if (now - lastFirebasePush > PUSH_INTERVAL_MS) {
    pushToFirebase();
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

void pushToFirebase() {
  FirebaseJson json;
  json.set("type", "flood");
  json.set("status", alertActive ? "red" : "green");
  json.set("humidity", lastHumidity);
  json.set("temperature", lastTemp);
  json.set("timestamp", (int)(millis() / 1000));

  if (!Firebase.RTDB.setJSON(&fbdo, "/liveNodes/node2", &json)) {
    Serial.println("Firebase push failed: " + fbdo.errorReason());
  }
}

void showStatus(const char* msg) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("NODE 2: FLOOD");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  display.setTextSize(2);
  display.setCursor(0, 25);
  display.println(msg);

  display.setTextSize(1);
  display.setCursor(0, 50);
  display.print("Hum: ");
  display.print(lastHumidity, 1);
  display.print("%  T:");
  display.print(lastTemp, 1);
  display.println("C");

  display.display();
}
