import { EventEmitter } from "events";
import moment from "moment-timezone";

export default class Clock extends EventEmitter {
	constructor(io, options) {
		super();

		this.io = io;

		this.options = Object.assign({
			timezone: "UTC",
			use24Hours: true,
			alarmDuration: 10
		}, options);

		this._showTime = false;
		this._state = "running";
		this._lastTick = null;

		this._timeFormat = this.options.use24Hours ? "HH:mm" : "hh:mm a";
		this._alarmTime = this.options.alarmTime;
		this._alarmDuration = +this.options.alarmDuration;
		this._snoozeDuration = +this.options.snoozeDuration;

		this._tick();
		setInterval(() => this._tick(), 500);
	}

	get showTime() {
		return this._showTime;
	}

	set showTime(val) {
		this._showTime = !!val;

		if (this._showTime) {
			this._displayTime();
		}
	}

	get isAlarming() {
		return this._state === "alarming";
	}

	get isSnoozing() {
		return this._state === "snoozing";
	}

	get alarmTime() {
		return this._alarmTime;
	}

	set alarmTime(val) {
		this._alarmTime = val;
		this._state = "running";

		if (this._alarmTime) {
			this._checkAlarm();
		}
	}

	snooze() {
		if (this.isAlarming && this._snoozeDuration > 0) {
			this.stopAlarm();
			this._state = "snoozing";
			this._snoozeTime = this._lastTick.clone().add(this._snoozeDuration, "minutes");
			this.emit("snooze");
		}
	}

	stopAlarm() {
		if (this.isAlarming) {
			this._state = "running";
			this.emit("alarm:stop");
		}
	}

	_tick() {
		const now = moment.tz(this.options.timezone);

		// only display time or check alarm if minute has changed
		if (!this._lastTick || now.isAfter(this._lastTick, "minutes")) {
			this._lastTick = now;

			if (this._showTime) {
				this._displayTime();
			}

			if (this._alarmTime) {
				this._checkAlarm();
			}
		}
	}

	_displayTime() {
		this.io.display(this._lastTick.format(this._timeFormat));
	}

	_checkAlarm() {
		const alarmTime = moment.tz(this._alarmTime, this._timeFormat, this.options.timezone);
		if (this.isAlarming) {
			const stopTime = alarmTime.add(this._alarmDuration, "minutes");

			if (this._lastTick.isSameOrAfter(stopTime)) {
				this.stopAlarm();
			}
		} else if ((this.isSnoozing && this._lastTick.isSameOrAfter(this._snoozeTime, "minutes")) ||
					(!this.isAlarming && this._lastTick.isSame(alarmTime, "minutes"))) {
			this._state = "alarming";
			this.emit("alarm");
		}
	}
}
