#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
#include <Wire.h>

#define UPDATE_INTERVAL 1000

#define LIGHT_HIGH 200
#define LIGHT_LOW 800

class SensorsHandler {
  public:
    void begin();
    void update();
    unsigned char getLightLevel();
    float getTemperature();

  private:
    unsigned long lastUpdate;

    unsigned char lightLevel;
    float temperature;
};

extern SensorsHandler Sensors;

#endif /* end of include guard: SENSORS_H */
