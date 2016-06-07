import { EventEmitter } from "events";
import { Board, Led, Pin } from "johnny-five";
import LedButton from "./ledButton";
import Light from "./light";
import config from "./config";

export default class IO extends EventEmitter {
	constructor() {
		super();

		this._initialized = false;

		const boardOptions = {
			repl: false,
			debug: true
		};

		switch (config.board.plugin) {
		case "raspi":
			const RaspiIO = require("raspi-io");
			boardOptions.io = new RaspiIO();
			break;
		default:
			break;
		}

		this.board = new Board(boardOptions);
		this.board.once("ready", () => this._initialize());
	}

	_initialize() {
		this.light = new Light(config.light);
		this.light.fadeToColor("#ff8080", 1000);
		this.digits = new Led.Digits({
			controller: config.display.useController ? "HT16K33" : undefined,
			addresses: config.display.addresses,
			pins: config.display.pins
		});

		this.feedbackMotor = new Pin({
			pin: config.buttons.feedback.pin,
			controller: config.buttons.feedback.useController ? "PCA9685" : undefined,
			address: config.buttons.feedback.address
		});

		this.setButton = new LedButton(config.buttons.set);
		this.setButton.on("press", () => this._buttonFeedback());

		this.plusButton = new LedButton(config.buttons.plus);
		this.plusButton.on("press", () => this._buttonFeedback());

		this.minusButton = new LedButton(config.buttons.minus);
		this.minusButton.on("press", () => this._buttonFeedback());

		this._initialized = true;
		this._brightness = 15;
		this.emit("ready");
	}

	get brightness() {
		return this._brightness;
	}

	set brightness(val) {
		this._brightness = Math.max(0, Math.min(15, val));

		this.digits.brightness(this._brightness);
		this.setButton.brightness = this._brightness;
		this.plusButton.brightness = this._brightness;
		this.minusButton.brightness = this._brightness;

		this.emit("brightness", this._brightness);
	}

	display(value) {
		this.digits.print(value);
	}

	clearDisplay() {
		this.digits.clear();
	}

	stopAll() {
		this.light.off();
		this.digits.off();
		this.setButton.disable();
		this.plusButton.disable();
		this.minusButton.disable();
	}

	_buttonFeedback() {
		this.feedbackMotor.high();
		this.board.wait(40, () => this.feedbackMotor.low());
	}
}
