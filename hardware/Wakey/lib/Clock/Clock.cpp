#include "Clock.h"

void Clock::begin() {
  rtc.begin();

  if (Serial) {
      Serial.println(F("[Clock] Started"));
  }
}

void Clock::update() {
  unsigned long curMillis = millis();

  if (!lastNtpUpdate || curMillis - lastNtpUpdate >= NTP_UPDATE_INTERVAL) {
    lastNtpUpdate = curMillis;

    ntp.begin();

    if (WiFi.isConnected() && ntp.forceUpdate()) {
      unsigned long curTimestamp = rtc.now().unixtime() - 7200;
      unsigned long ntpTimestamp = ntp.getEpochTime();

      // DEBUG
      if (Serial) {
        Serial.print(F("[Clock] Fetched NTP Time. Skew: "));
        Serial.print(ntpTimestamp - curTimestamp);
        Serial.println(F("ms"));
      }

      rtc.adjust(DateTime(ntpTimestamp + 7200));
    }

    // no need to keep udp port open until next request
    ntp.end();
  }

  if (!lastUpdate || curMillis - lastUpdate >= UPDATE_INTERVAL) {
    DateTime now = rtc.now();
    unsigned long curTime = now.unixtime();

    lastUpdate = curMillis;

    // check if hour or minute has changed
    if (curTime != lastTime) {
      lastTime = curTime;
      changeCallback(now);
    }
  }
}

DateTime Clock::now() {
  return rtc.now();
}

void Clock::onChange(clock_change_callback cb) {
  changeCallback = cb;
}
