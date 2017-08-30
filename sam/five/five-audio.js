var psynth = new Tone.PolySynth(12, Tone.FMSynth).toMaster();
psynth.volume.value = -24;
psynth.set("harmonicity", 1);
psynth.set("modulationIndex", 1);
psynth.set({
	modulation: {
		type: "sine"
	},
	oscillator: {
		type: "sine"
	},
	envelope: {
		attack: 0.001,
		decay: 0.3,
		sustain: 0.2,
		release: 0.9
	}
});

var psynth2 = new Tone.PolySynth(4, Tone.FMSynth);
psynth2.volume.value = -24;
psynth2.set("harmonicity", 2);
psynth2.set("modulationIndex", 0.5);
psynth2.set({
	modulation: {
		type: "sine"
	},
	oscillator: {
		type: "sine"
	},
	envelope: {
		attack: 0.02,
		decay: 0.5,
		sustain: 0.1,
		release: 0.9
	}
});

var trem = new Tone.Tremolo(3, 0.5).toMaster().start();
psynth2.connect(trem);

var pat1 = new Tone.Pattern(function(time, note){
  psynth.triggerAttackRelease(note, "4n", time);
}, [
	Tone.Frequency(72, "midi"),
	Tone.Frequency(74, "midi"),
	Tone.Frequency(77, "midi"),
	Tone.Frequency(79, "midi")], "up");
pat1.humanize = true;
pat1.interval = "4n";
pat1.start("4n");

var pat2 = new Tone.Pattern(function(time, note){
  psynth.triggerAttackRelease(note, "1n", time);
}, [
	Tone.Frequency(80, "midi"),
	Tone.Frequency(82, "midi"),
	Tone.Frequency(68, "midi")], "up");
pat2.humanize = true;
pat2.interval = "1n";
pat2.start(0.25);

var pat3 = new Tone.Pattern(function(time, note){
  psynth2.triggerAttackRelease(note, "2n", time);
}, [
	Tone.Frequency(94, "midi"),
	Tone.Frequency(92, "midi"),
	Tone.Frequency(92, "midi"),
	Tone.Frequency(89, "midi")], "up");
pat3.humanize = true;
pat3.interval = "1m";
pat3.start(0.5);

Tone.Transport.loopEnd = '2m';
Tone.Transport.loop = true;
Tone.Transport.bpm.value = 98;
Tone.Transport.start();