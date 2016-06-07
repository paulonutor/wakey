import { EventEmitter } from "events";
import { Animation, Led } from "johnny-five";

function colorToRGBW(color) {
	if (color.length === 7 && color[0] === "#") {
		color = color.slice(1);
	}

	let red = parseInt(color.slice(0, 2), 16);
	let green = parseInt(color.slice(2, 4), 16);
	let blue = parseInt(color.slice(4, 6), 16);

	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);

	let white = min / max < 0.5 ? (min * max) / (max - min) : max;
	const gain = min > 0 ? (white + max) / min : 255;

	red = Math.floor(((gain * red) - white) / 255);
	green = Math.floor(((gain * green) - white) / 255);
	blue = Math.floor(((gain * blue) - white) / 255);
	white = Math.floor(white * 0.2);

	return { red, green, blue, white };
}

export default class Light extends EventEmitter {
	constructor(options) {
		super();

		const ledOptions = {};

		if (options.useController) {
			ledOptions.controller = "PCA9685";
			ledOptions.address = options.address;
		}

		this._leds = [
			new Led({ pin: options.redPin, ...ledOptions }),
			new Led({ pin: options.greenPin, ...ledOptions }),
			new Led({ pin: options.bluePin, ...ledOptions }),
			new Led({ pin: options.whitePin, ...ledOptions })
		];

		this._animation = new Animation(this);
	}

	get animation() {
		return this._animation;
	}

	off() {
		this._animation.stop();
		this._updateLeds(0, 0, 0, 0);
	}

	fadeOut(ms) {
		this._fadeToValues(0, 0, 0, 0, ms);
	}

	fadeToColor(color, ms) {
		const values = colorToRGBW(color);
		this._fadeToValues(values.red, values.green, values.blue, values.white, ms);
	}

	_fadeToValues(red, green, blue, white, ms) {
		this._animation.stop();
		this._animation.enqueue({
			duration: ms,
			easing: "inOutCube",
			keyFrames: [
				[null, { value: red }],
				[null, { value: green }],
				[null, { value: blue }],
				[null, { value: white }]
			]
		});
	}

	[Animation.normalize](keyFrameSet) {
		console.log(keyFrameSet);
	}

	[Animation.render](value) {
		console.log(value);
	}
}
