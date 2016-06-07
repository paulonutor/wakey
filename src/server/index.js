import express from "express";
import IO from "./io";
import Clock from "./clock";

const server = express();
const io = new IO();

io.on("ready", () => {
	const clock = new Clock(io, {
		timezone: "Europe/Berlin",
		alarmTime: "13:26",
		alarmDuration: 1,
		snoozeDuration: 1
	});

	clock.showTime = true;

	clock.on("alarm", () => {
		clock.snooze();
		io.fadeToColor("#ff0066", 10 * 1000);
		setTimeout(() => {
			io.fadeOut(2 * 1000);
		}, 10 * 1000);
	});

	const increaseBrightness = () => io.brightness = io.brightness + 1;
	const decreaseBrightness = () => io.brightness = io.brightness - 1;

	io.plusButton.on("press", increaseBrightness);
	io.plusButton.on("hold", increaseBrightness);
	io.minusButton.on("press", decreaseBrightness);
	io.minusButton.on("hold", decreaseBrightness);

	let wasShowingTime,
		displayTimeout;

	io.on("brightness", brightness => {
		io.display(` b ${(" " + (brightness + 1)).slice(-2)}`);

		if (displayTimeout) {
			clearTimeout(displayTimeout);
			displayTimeout = null;
		} else {
			wasShowingTime = clock.showTime;
			clock.showTime = false;
		}

		displayTimeout = setTimeout(() => {
			if (wasShowingTime) {
				clock.showTime = true;
			} else {
				io.clearDisplay();
			}

			displayTimeout = null;
		}, 2000);
	});
});

server.get("/", (req, res) => {
	res.send("test");
});

server.listen(8000, () => {
	console.log("Server running...");
});

process.on("SIGINT", () => {
	io.stopAll();
	process.exit();
});
