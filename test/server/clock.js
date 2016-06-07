import test from "ava";
import sinon from "sinon";
import IO from "../../src/server/io";
import Clock from "../../src/server/clock";

test.beforeEach(t => {
	t.context.timer = sinon.useFakeTimers(50399000); // 13:59:59 or 01:59:59 PM
	t.context.io = sinon.createStubInstance(IO);
});

test.afterEach(t => {
	t.context.timer.restore();
});

test("display current time (24 Hours)", t => {
	const { timer, io } = t.context;
	const clock = new Clock(io);

	clock.showTime = true;
	t.is(io.display.lastCall.args[0], "13:59");

	timer.tick(1000);
	t.is(io.display.lastCall.args[0], "14:00");
});

test("display current time (12 Hours)", t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { use24Hours: false });

	clock.showTime = true;
	t.is(io.display.lastCall.args[0], "01:59 pm");

	timer.tick(1000);
	t.is(io.display.lastCall.args[0], "02:00 pm");
});

test("display current time (timezoned)", t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { timezone: "EST" });

	clock.showTime = true;
	t.is(io.display.lastCall.args[0], "08:59");

	timer.tick(1000);
	t.is(io.display.lastCall.args[0], "09:00");
});

test("enable alarm through options", t => {
	const { io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00" });

	t.is(clock.alarmTime, "14:00");
});

test("enable alarm through property", t => {
	const { io } = t.context;
	const clock = new Clock(io);

	clock.alarmTime = "14:00";
	t.is(clock.alarmTime, "14:00");
});

test("set alarm status when alarm time is reached", t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00" });

	t.false(clock.isAlarming);

	timer.tick(1000);
	t.true(clock.isAlarming);
});

test('fire "alarm" event when alarm time is reached', t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00" });
	const eventSpy = sinon.spy();

	clock.on("alarm", eventSpy);

	timer.tick(1000);
	t.true(eventSpy.called);

    // don't fire event a second time
	timer.tick(1000);
	t.is(eventSpy.callCount, 1);
});

test("stop alarm after set alarm duration", t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00", alarmDuration: 10 });

	timer.tick(1000);
	t.true(clock.isAlarming);

	// advance clock 10 minutes
	timer.setSystemTime(Date.now() + 600000);
	timer.tick(1000);

	t.false(clock.isAlarming);
});

test('fire "alarm:stop" event after set alarm duration', t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00", alarmDuration: 10 });
	const eventSpy = sinon.spy();

	clock.on("alarm:stop", eventSpy);

	timer.tick(1000);
	t.false(eventSpy.called);

	// advance clock 10 minutes
	timer.setSystemTime(Date.now() + 600000);
	timer.tick(1000);

	t.true(eventSpy.called);
});

test("stop alarm on stopAlarm() call", t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00" });

	timer.tick(1000);
	t.true(clock.isAlarming);

	clock.stopAlarm();
	t.false(clock.isAlarming);
});

test('fire "alarm:stop" event on stopAlarm() call', t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00" });
	const eventSpy = sinon.spy();

	clock.on("alarm:stop", eventSpy);

	timer.tick(1000);
	t.false(eventSpy.called);

	clock.stopAlarm();
	t.true(eventSpy.called);
});

test("don't allow snooze if snoozeDuration is not set", t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00" });

	timer.tick(1000);
	t.true(clock.isAlarming);
	t.false(clock.isSnoozing);

	clock.snooze();
	t.true(clock.isAlarming);
	t.false(clock.isSnoozing);
});

test("set snooze status when alarm time is reached and snooze() is called", t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00", snoozeDuration: 10 });

	timer.tick(1000);
	t.true(clock.isAlarming);
	t.false(clock.isSnoozing);

	clock.snooze();
	t.true(clock.isSnoozing);
	t.false(clock.isAlarming);
});

test('fire "snooze" event when alarm time is reached and snooze() is called', t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00", snoozeDuration: 10 });
	const eventSpy = sinon.spy();

	clock.on("snooze", eventSpy);

	timer.tick(1000);
	t.false(eventSpy.called);

	clock.snooze();
	t.true(eventSpy.called);
});

test("set alarm status when snooze time is reached", t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00", snoozeDuration: 10 });

	timer.tick(1000);
	clock.snooze();
	t.false(clock.isAlarming);
	t.true(clock.isSnoozing);

	// advance clock 10 minutes
	timer.setSystemTime(Date.now() + 600000);
	timer.tick(1000);
	t.true(clock.isAlarming);
	t.false(clock.isSnoozing);
});

test('fire "alarm" event when snooze time is reached', t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00", snoozeDuration: 10 });
	const eventSpy = sinon.spy();

	clock.on("alarm", eventSpy);

	timer.tick(1000);
	clock.snooze();
	t.is(eventSpy.callCount, 1);

	// advance clock 10 minutes
	timer.setSystemTime(Date.now() + 600000);
	timer.tick(1000);
	t.is(eventSpy.callCount, 2);
});

test("begin snooze timer when snooze() is called", t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00", snoozeDuration: 10 });

	timer.tick(1000);
	t.true(clock.isAlarming);
	t.false(clock.isSnoozing);

	// advance clock 5 minutes. snooze starts here
	timer.setSystemTime(Date.now() + 300000);
	timer.tick(1000);
	clock.snooze();
	t.false(clock.isAlarming);
	t.true(clock.isSnoozing);

	// advance clock 5 minutes.
	timer.setSystemTime(Date.now() + 300000);
	timer.tick(1000);
	t.false(clock.isAlarming);
	t.true(clock.isSnoozing);

	// advance clock 5 minutes
	timer.setSystemTime(Date.now() + 300000);
	timer.tick(1000);
	t.true(clock.isAlarming);
	t.false(clock.isSnoozing);
});

test("multiple snoozes", t => {
	const { timer, io } = t.context;
	const clock = new Clock(io, { alarmTime: "14:00", snoozeDuration: 10 });

	timer.tick(1000);
	t.true(clock.isAlarming);
	t.false(clock.isSnoozing);
	clock.snooze();
	t.false(clock.isAlarming);
	t.true(clock.isSnoozing);

	// advance clock 10 minutes.
	timer.setSystemTime(Date.now() + 600000);
	timer.tick(1000);
	t.true(clock.isAlarming);
	t.false(clock.isSnoozing);
	clock.snooze();
	t.false(clock.isAlarming);
	t.true(clock.isSnoozing);

	// advance clock 10 minutes.
	timer.setSystemTime(Date.now() + 600000);
	timer.tick(1000);
	t.true(clock.isAlarming);
	t.false(clock.isSnoozing);
	clock.snooze();
	t.false(clock.isAlarming);
	t.true(clock.isSnoozing);
});
