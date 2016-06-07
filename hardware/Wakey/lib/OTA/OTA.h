#ifndef OTA_H
#define OTA_H

#include <functional>
#include <ESP8266mDNS.h>
#include <ArduinoOTA.h>

typedef std::function<void(unsigned char)> ota_progress_callback;

class OTAHandler {
  public:
    void begin();
    void update();
    bool isUpdating();
    void onProgress(ota_progress_callback cb);

  private:
    bool _isUpdating;

    ota_progress_callback _progressCallback;
};

extern OTAHandler OTA;

#endif /* end of include guard: OTA_H */
