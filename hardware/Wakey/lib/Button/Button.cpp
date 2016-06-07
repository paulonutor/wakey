#include "Button.h"

Button::Button(int pin, Led* led) {
  _pin = pin;
  _led = led;

  setMaxLedBrightness(255);

  pinMode(pin, INPUT_PULLUP);
}

void Button::onChange(button_change_callback cb) {
  _changeCallback = cb;
}

void Button::update() {
  _led->update();

  bool pinState = digitalRead(_pin) == LOW;

  if (!_isDebouncing) {
    if (_state != pinState) {
      _isDebouncing = true;
      _debounceStart = millis();
      _changeState = pinState;
    }
  } else if (millis() - _debounceStart >= DEBOUNCE_DURATION) {
    _isDebouncing = false;

    if (_changeState == pinState) {
      _setState(_changeState);
    }
  }

  if (_forceLedUpdate) {
    _updateLed();
  }
}

void Button::setMaxLedBrightness(byte brightness) {
  _maxLedBrightness = brightness;
  _forceLedUpdate = true;
}

void Button::_setState(bool state) {
  if (_state != state) {
    _state = state;

    if (_changeCallback) {
      _changeCallback(state);
    }

    _updateLed();
  }
}

void Button::_updateLed() {
  _led->fadeTo(_state ? _maxLedBrightness : _maxLedBrightness * 0.2, _state ? 100 : 0);
  _forceLedUpdate = false;
}
