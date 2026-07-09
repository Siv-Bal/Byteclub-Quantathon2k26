/*
  SENTINEL / Q-RESCUE — NODE 3: LANDSLIDE DETECTION
  Hardware: ESP32 + 0.96" OLED (SSD1306, I2C) + MPU6050 (Accelerometer/Gyro)

  Uses the MPU6050_light library (by rfetick) instead of Adafruit_MPU6050.
  This library does the sensor fusion internally and gives you ready-to-use
  filtered angles via mpu.getAngleX() / getAngleY() / getAngleZ() — no manual
  atan2 math needed.

  LOGIC:
  - mpu.update() refreshes filtered angle estimates every loop.
  - We use getAngleX() as the "tilt left/right" (roll) value.
    NOTE: Depending on how you physically mount the MPU6050 on the node
    enclosure, "tilt left/right" might actually show up on getAngleY()
    instead. If left/right tilting isn't triggering correctly during
    testing, just swap TILT_AXIS below from X to Y — no other code changes
    needed.
  - If |tilt| >= TILT_THRESHOLD_DEG sustained for CONFIRM_COUNT readings,
    in EITHER direction (left OR right) -> RED (landslide detected).
  - If tilt returns to near-level for CONFIRM_COUNT readings -> GREEN.

  FIREBASE PATH WRITTEN:
  /liveNodes/node3
      type       : "landslide"
      status     : "red" | "green"
      tiltDeg    : <float, signed degrees; negative = left, positive = right>
      timestamp  : <seconds since boot>

  LIBRARIES NEEDED (Arduino Library Manager):
  - Firebase ESP32 Client   by Mobizt
  - Adafruit SSD1306, Adafruit GFX
  - MPU6050_light           by rfetick
*/

#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <MPU6050_light.h>
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
#define OLED_SDA        21
#define OLED_SCL        22
// MPU6050 shares the same I2C bus (SDA 21 / SCL 22) — default address 0x68
// ------------------------------------------------

// Which axis represents "tilt left/right" on your physical mount.
// Try 'X' first; if left/right tilt doesn't register, change to 'Y'.
#define TILT_AXIS       'X'

MPU6050 mpu(Wire);

#define SCREEN_WIDTH    128
#define SCREEN_HEIGHT   64
#define OLED_RESET      -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

FirebaseData   fbdo;
FirebaseAuth   auth;
FirebaseConfig config;

// ---------------- DETECTION LOGIC CONFIG --------
const float          TILT_THRESHOLD_DEG = 25.0;  // trigger if tilt exceeds this either side
const int            CONFIRM_COUNT      = 3;      // consecutive readings to confirm state change
const unsigned long  READ_INTERVAL_MS   = 200;
// -------------------------------------------------

bool alertActive = false;
int  tiltCount = 0;
int  levelCount = 0;
float lastTiltDeg = 0;
unsigned long lastReadTime = 0;
unsigned long lastFirebasePush = 0;
const unsigned long PUSH_INTERVAL_MS = 1000;

void setup() {
  Serial.begin(115200);
  Wire.begin(OLED_SDA, OLED_SCL);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED init failed");
  }
  display.clearDisplay();
  showStatus("BOOTING...");

  byte status = mpu.begin();
  Serial.print("MPU6050 status: ");
  Serial.println(status);
  while (status != 0) {
    Serial.println("MPU6050 connection failed, retrying...");
    showStatus("MPU ERROR");
    delay(1000);
    status = mpu.begin();
  }

  Serial.println("Calculating MPU6050 offsets, keep the sensor still...");
  showStatus("CALIBRATING");
  delay(1000);
  mpu.calcOffsets();   // keep the sensor flat and still during this step
  Serial.println("Done calculating offsets");

  connectWiFi();
  setupFirebase();

  showStatus("SAFE");
}

void loop() {
  mpu.update();
  unsigned long now = millis();

  if (now - lastReadTime >= READ_INTERVAL_MS) {
    lastReadTime = now;

    float tilt = (TILT_AXIS == 'Y') ? mpu.getAngleY() : mpu.getAngleX();
    lastTiltDeg = tilt;

    if (fabs(tilt) >= TILT_THRESHOLD_DEG) {
      tiltCount++;
      levelCount = 0;
    } else {
      levelCount++;
      tiltCount = 0;
    }

    if (!alertActive && tiltCount >= CONFIRM_COUNT) {
      alertActive = true;
      showStatus("LANDSLIDE!");
      pushToFirebase();
    } else if (alertActive && levelCount >= CONFIRM_COUNT) {
      alertActive = false;
      showStatus("SAFE");
      pushToFirebase();
    } else {
      showStatus(alertActive ? "LANDSLIDE!" : "SAFE");
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
  json.set("type", "landslide");
  json.set("status", alertActive ? "red" : "green");
  json.set("tiltDeg", lastTiltDeg);
  json.set("timestamp", (int)(millis() / 1000));

  if (!Firebase.RTDB.setJSON(&fbdo, "/liveNodes/node3", &json)) {
    Serial.println("Firebase push failed: " + fbdo.errorReason());
  }
}

void showStatus(const char* msg) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("NODE 3: LANDSLIDE");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  display.setTextSize(2);
  display.setCursor(0, 25);
  display.println(msg);

  display.setTextSize(1);
  display.setCursor(0, 50);
  display.print("Tilt: ");
  display.print(lastTiltDeg, 1);
  display.println(" deg");

  display.display();
}
