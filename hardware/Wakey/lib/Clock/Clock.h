#ifndef CLOCK_H
#define CLOCK_H

#include <functional>
#include <WiFiUDP.h>
#include <ESP8266WiFi.h>
#include <NTPClient.h>
#include <RTClib.h>

#define UPDATE_INTERVAL 500 // check time every seconds
#define NTP_UPDATE_INTERVAL 3600000 // update ntp every hour

typedef std::function<void(DateTime)> clock_change_callback;

class Clock {
public:
  void begin();
  void update();
  DateTime now();
  void onChange(clock_change_callback cb);
private:
  WiFiUDP ntpUdp;
  NTPClient ntp = NTPClient(ntpUdp);
  RTC_DS1307 rtc;

  clock_change_callback changeCallback;

  unsigned long lastNtpUpdate;
  unsigned long lastUpdate;
  unsigned long lastTime;
};

#endif /* end of include guard: CLOCK_H */
