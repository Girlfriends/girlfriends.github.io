var psynth = new Tone.PolySynth(12, Tone.FMSynth).toMaster();
psynth.volume.value = -24;
psynth.set("harmonicity", 1);
psynth.set("modulationIndex", 0.25);
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

// var freeverb = new Tone.Freeverb();
var feedbackDelay = new Tone.FeedbackDelay("8n", 0.4).toMaster();

psynth.connect(feedbackDelay);

var pat1 = new Tone.Pattern(function(time, note){
  psynth.triggerAttackRelease(note, "4n", time);
}, [
	Tone.Frequency(60, "midi"),
	Tone.Frequency(67, "midi"),
	Tone.Frequency(69, "midi"),
	Tone.Frequency(71, "midi"),
	Tone.Frequency(74, "midi"),], "upDown");
pat1.humanize = true;
pat1.interval = "1n";
pat1.start("4n");

var pat2 = new Tone.Pattern(function(time, note){
  psynth2.triggerAttackRelease(note, "2n", time);
}, [
	Tone.Frequency(67, "midi"),
	Tone.Frequency(64, "midi"),
	Tone.Frequency(62, "midi"),
	Tone.Frequency(60, "midi"),], "upDown");
pat2.humanize = false;
pat2.interval = "2n";
pat2.start("4n");

// Tone.Transport.loopEnd = '2m';
// Tone.Transport.loop = true;
Tone.Transport.bpm.value = 78;
Tone.Transport.start();