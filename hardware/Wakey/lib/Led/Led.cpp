#include "Led.h"

float easeIn(float t, float b, float c, float d) {
	return -c * cos(t/d * (PI/2)) + c + b;
}

float easeOut(float t, float b, float c, float d) {
	return c * sin(t/d * (PI/2)) + b;
}

Led::Led(Adafruit_PWMServoDriver pwm, int pin) {
  _pwm = pwm;
  _pin = pin;

	_targetValue = 0;
	_setValue(0, true);
}

void Led::on() {
  fadeTo(255, 0);
}

void Led::off() {
  fadeTo(0, 0);
}

void Led::setBrightness(unsigned char value) {
  fadeTo(value, 0);
}

void Led::fadeOn(unsigned long ms) {
  fadeTo(255, ms);
}

void Led::fadeOff(unsigned long ms) {
  fadeTo(0, ms);
}

void Led::fadeTo(unsigned char value, unsigned long ms) {
	_startValue = _currentValue;
	_targetValue = min(255, value) * 4095 / 255;
	_duration = ms * 1000;
	_runningTime = 0;
	_lastFrame = 0;
  _easingFunc = _targetValue > _startValue ? easeIn : easeOut;
	update();
}

void Led::update() {
  // do nothing is target value is already reached
  if (_currentValue == _targetValue) {
    return;
  }

  if (micros() - _lastFrame >= FRAME_INTERVAL) {
    _lastFrame = micros();

    if (_runningTime >= _duration) {
      _runningTime = _duration;
      _setValue(_targetValue);
    } else if (_duration > 0) {
			int valueDiff = _targetValue - _startValue;
			unsigned int newValue = _easingFunc(_runningTime, _startValue, valueDiff, _duration);
      _setValue(newValue);
      _runningTime += FRAME_INTERVAL;
    }
  }
}

void Led::_setValue(unsigned int value, bool force) {
  if (force || _currentValue != value) {
		_currentValue = value;
		_pwm.setPin(_pin, value);
		yield();
  }
}
