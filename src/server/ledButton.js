import { EventEmitter } from "events";
import { Button, Led } from "johnny-five";

export default class LedButton extends EventEmitter {
	constructor(options) {
		super();

		this._button = new Button({	pin: options.pin, invert: options.invert });
		this._led = null;

		if (options.ledPin) {
			this._led = new Led({
				pin: options.ledPin,
				controller: options.useController ? "PCA9685" : "DEFAULT",
				address: options.address
			});

			let intensity = parseInt(options.ledIntensity, 10);

			if (isNaN(intensity)) {
				intensity = 100;
			}

			this._ledIntensity = Math.max(1, Math.min(100, intensity)) * 255 / 100;
			this._brightness = 15;
		}

		this._button.on("hold", () => this._reemit("hold"));
		this._button.on("press", () => this._reemit("press", true));
		this._button.on("release", () => this._reemit("release", true));

		this.state = true;
	}

	get pressed() {
		return this._button.isDown;
	}

	get state() {
		return this._state;
	}

	set state(val) {
		if (this._state != val) {
			this._state = !!val;
			this._setLed(true);
		}
	}

	get brightness() {
		return this._led ? this._brightness : 0;
	}

	set brightness(val) {
		if (this._led) {
			this._brightness = Math.max(0, Math.min(15, val));
			this._setLed();
		}
	}

	disable() {
		this.state = false;
	}

	enable() {
		this.state = true;
	}

	_setLed(fade = false) {
		if (!this._led) {
			return;
		}

		const maxValue = this._ledIntensity * ((this._brightness + 1) / 16);
		const value = !this.state ? 0 : (this.pressed ? maxValue : maxValue * 0.2);

		if (fade) {
			this._led.fade(value, 500);
		} else {
			this._led.brightness(value);
		}
	}

	_reemit(event, setLed = false) {
		if (this.state) {
			if (setLed) {
				this._setLed();
			}
			this.emit(event);
		}
	}
}
