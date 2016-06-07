#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <Adafruit_LEDBackpack.h>
#include <Adafruit_PWMServoDriver.h>

#include "OTA.h"
#include "Sensors.h"
#include "Led.h"
#include "Button.h"
#include "Clock.h"

const char* ssid = "******";
const char* password = "******";

Adafruit_7segment display;
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

Led* redLed;
Led* greenLed;
Led* blueLed;
Led* whiteLed;

Button* setButton;
Button* plusButton;
Button* minusButton;

Clock clock;

#define SENSOR_CHECK_INTERVAL 5000

unsigned long lastSensorCheck;

void displayTime(DateTime now) {
  unsigned char hour = now.hour();
  unsigned char minute = now.minute();

  display.writeDigitNum(0, hour / 10, false);
  display.writeDigitNum(1, hour % 10, false);
  display.drawColon(now.second() % 2 == 0);
  display.writeDigitNum(3, minute / 10, false);
  display.writeDigitNum(4, minute % 10, false);

  display.writeDisplay();
}

void displayUpdateProgress(unsigned char progress) {
  display.print(progress, DEC);
  display.writeDigitRaw(0, 0x1C);
  display.writeDisplay();
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("Booting"));

  Wire.begin();

  display.begin(0x71);
  display.clear();
  display.writeDisplay();

  pwm.begin();
  pwm.setPWMFreq(200);

  // connect to wifi
  Serial.println(F("[WIFI] Connecting to AP"));
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    Serial.println(F("[WIFI] Connection Failed! Rebooting..."));
    delay(5000);
    ESP.restart();
  }

  Serial.println(F("[WIFI] Connected"));

  delay(10);

  // init components
  OTA.onProgress(displayUpdateProgress);
  OTA.begin();

  Sensors.begin();

  clock.onChange(displayTime);
  clock.begin();

  // show post init pattern
  display.printError();
  display.writeDisplay();

  redLed = new Led(pwm, 0);
  greenLed = new Led(pwm, 1);
  blueLed = new Led(pwm, 2);
  whiteLed = new Led(pwm, 3);

  setButton = new Button(14, new Led(pwm, 4));
  plusButton = new Button(12, new Led(pwm, 5));
  minusButton = new Button(13, new Led(pwm, 6));

  //setButton.onChange([](bool isPressed) { Serial.println("Set Button pressed"); });
  plusButton->setMaxLedBrightness(50);
  minusButton->setMaxLedBrightness(50);

  Serial.println(F("Setup Finished"));
}

void loop() {
  OTA.update();

  if (!OTA.isUpdating()) {
    Sensors.update();

    clock.update();

    redLed->update();
    greenLed->update();
    blueLed->update();
    whiteLed->update();

    setButton->update();
    plusButton->update();
    minusButton->update();

    if (millis() - lastSensorCheck >= SENSOR_CHECK_INTERVAL) {
      display.setBrightness(15 * pow(Sensors.getLightLevel() / 255.0, 2));
      lastSensorCheck = millis();
    }
  }
}
