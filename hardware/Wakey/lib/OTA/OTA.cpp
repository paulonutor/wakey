#include <OTA.h>

void OTAHandler::begin() {
  ArduinoOTA.onStart([this]() {
    _isUpdating = true;

    Serial.println(F("OTA: Starting Update"));

    if (_progressCallback) {
      _progressCallback(0);
    }
  });

  ArduinoOTA.onEnd([this]() {
    _isUpdating = false;
    Serial.println();
    Serial.println(F("OTA: Update Finished"));
  });

  ArduinoOTA.onProgress([this](unsigned int uploaded, unsigned int total) {
    unsigned char progress = uploaded * 100 / total;

    Serial.print(F("OTA: Progress: "));
    Serial.printf("%u%%", progress);
    Serial.print("\r");

    if (_progressCallback) {
      _progressCallback(progress);
    }
  });

  ArduinoOTA.onError([this](ota_error_t error) {
    _isUpdating = false;
    Serial.print(F("OTA: Error - "));

    if (error == OTA_AUTH_ERROR) Serial.println(F("Auth Failed"));
    else if (error == OTA_BEGIN_ERROR) Serial.println(F("Begin Failed"));
    else if (error == OTA_CONNECT_ERROR) Serial.println(F("Connect Failed"));
    else if (error == OTA_RECEIVE_ERROR) Serial.println(F("Receive Failed"));
    else if (error == OTA_END_ERROR) Serial.println(F("End Failed"));
  });

  ArduinoOTA.begin();

  Serial.println(F("OTA: Ready"));
}

void OTAHandler::update() {
  ArduinoOTA.handle();
}

bool OTAHandler::isUpdating() {
  return _isUpdating;
}

void OTAHandler::onProgress(ota_progress_callback cb) {
  _progressCallback = cb;
}

OTAHandler OTA;
