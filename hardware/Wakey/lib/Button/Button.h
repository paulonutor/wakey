#ifndef BUTTON_H
#define BUTTON_H

#include <functional>
#include "Led.h"

#define DEBOUNCE_DURATION 30

typedef std::function<void(bool)> button_change_callback;

class Button {
  public:
    Button(int pin, Led* led);
    void onChange(button_change_callback cb);
    void update();
    void setMaxLedBrightness(byte brightness);
    bool isPressed();

  private:
    int _pin;
    Led* _led;
    byte _maxLedBrightness;
    bool _state;
    bool _forceLedUpdate;

    unsigned long _debounceStart;
    bool _changeState;
    bool _isDebouncing;

    button_change_callback _changeCallback;

    void _setState(bool state);
    void _updateLed();
};

#endif /* end of include guard: BUTTON_H */
