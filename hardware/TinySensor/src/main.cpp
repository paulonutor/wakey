#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#if defined (__AVR_ATtiny85__)
#include <TinyWireS.h>
#else
#include <Wire.h>
#endif

#define I2C_SLAVE_ADDRESS 0x4
#define REGISTER_SIZE 6

#define ANALOG_1_PIN A3
#define ANALOG_2_PIN A2

#if defined (__AVR_ATtiny85__)
#define ONE_WIRE_PIN 1
#else
#define ONE_WIRE_PIN 2
#endif

#define AVERAGE_INTERVAL 1000
#define TEMP_READ_INTERVAL 750

unsigned char registers[REGISTER_SIZE] = {
  0x0, // Analog 1 MSB
  0x0, // Analog 1 LSB
  0x0, // Analog 2 MSB
  0x0, // Analog 2 LSB
  0x0, // Temperature MSB
  0x0  // Temperature LSB
};

unsigned long values[] = { 0, 0 };
unsigned int averageCounter = 0;

unsigned long lastAverage = 0;

OneWire oneWire(ONE_WIRE_PIN);
DallasTemperature tempSensors(&oneWire);
DeviceAddress tempDeviceAddress;

unsigned long lastTempRead;

void request() {
  #if defined (__AVR_ATtiny85__)
  for (int i = 0; i < REGISTER_SIZE; i++) {
    TinyWireS.send(registers[i]);
  }
  #else
  Wire.write(registers, REGISTER_SIZE);
  #endif
}

void setup() {
  #if defined (__AVR_ATtiny85__)
  TinyWireS.begin(I2C_SLAVE_ADDRESS);
  TinyWireS.onRequest(request);
  #else
  Wire.begin(I2C_SLAVE_ADDRESS);
  Wire.onRequest(request);
  #endif

  tempSensors.begin();
  tempSensors.getAddress(tempDeviceAddress, 0);
  tempSensors.setResolution(tempDeviceAddress, 12);

  tempSensors.setWaitForConversion(false);
  tempSensors.requestTemperatures();
  lastTempRead = millis();
}

void loop() {
  values[0] += analogRead(ANALOG_1_PIN);
  values[1] += analogRead(ANALOG_2_PIN);
  averageCounter++;

  if (millis() - lastAverage >= AVERAGE_INTERVAL) {
    unsigned int value = values[0] / averageCounter;
    registers[0] = highByte(value);
    registers[1] = lowByte(value);

    value = values[1] / averageCounter;
    registers[2] = highByte(value);
    registers[3] = lowByte(value);

    averageCounter = 0;
    values[0] = 0;
    values[1] = 0;

    lastAverage = millis();
  }

  if (millis() - lastTempRead >= TEMP_READ_INTERVAL) {
    int temp = tempSensors.getTemp(tempDeviceAddress);
    registers[4] = highByte(temp);
    registers[5] = lowByte(temp);

    tempSensors.requestTemperatures();
    lastTempRead = millis();
  }
}
