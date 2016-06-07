#ifndef LED_H
#define LED_H

#include <functional>
#include <Adafruit_PWMServoDriver.h>

#define FRAME_INTERVAL 16667 // ~60FPS in microseconds

typedef std::function<float(float, float, float, float)> easing_func;

class Led {
  public:
    Led(Adafruit_PWMServoDriver pwm, int pin);
    void update();
    void on();
    void off();
    void setBrightness(unsigned char value);
    void fadeTo(unsigned char value, unsigned long ms);
    void fadeOn(unsigned long ms);
    void fadeOff(unsigned long ms);

  private:
    Adafruit_PWMServoDriver _pwm;
    int _pin;

    unsigned long _lastFrame;

    // state
    unsigned int _currentValue;
    unsigned int _startValue;
    unsigned int _targetValue;
    easing_func _easingFunc;

    unsigned long _runningTime;
    unsigned long _duration;

    void _setValue(unsigned int value, bool force = false);
};

#endif /* end of include guard: LED_H */
