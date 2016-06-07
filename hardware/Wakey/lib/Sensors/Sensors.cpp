#include "Sensors.h"

void SensorsHandler::begin() {
  Wire.begin();
}

void SensorsHandler::update() {
  if (millis() - lastUpdate >= UPDATE_INTERVAL) {
    Wire.requestFrom(0x4, 6);

    int lightValue = word(Wire.read(), Wire.read());
    lightLevel = map(constrain(lightValue, LIGHT_HIGH, LIGHT_LOW), LIGHT_HIGH, LIGHT_LOW, 255, 0);
    word(Wire.read(), Wire.read()); // ignore
    temperature = word(Wire.read(), Wire.read()) * 0.0078125;

    lastUpdate = millis();
  }
}

unsigned char SensorsHandler::getLightLevel() {
  return lightLevel;
}

float SensorsHandler::getTemperature() {
  return temperature;
}

SensorsHandler Sensors;
