export default {
	board: {
		plugin: "_raspi"
	},
	light: {
		useController: true,
		address: 0x40,
		redPin: 0,
		greenPin: 1,
		bluePin: 2,
		whitePin: 3
	},
	display: {
		useController: true,
		addresses: [0x71]
	},
	buttons: {
		feedback: {
			pin: "GPIO4",
			useController: false,
			address: 0x40
		},
		set: {
			pin: "GPIO17",
			ledPin: 4,
			invert: true,
			useController: true,
			address: 0x40
		},
		plus: {
			pin: "GPIO27",
			ledPin: 5,
			ledIntensity: 70,
			invert: true,
			useController: true,
			address: 0x40
		},
		minus: {
			pin: "GPIO22",
			ledPin: 6,
			ledIntensity: 70,
			invert: true,
			useController: true,
			address: 0x40
		}
	}
};
