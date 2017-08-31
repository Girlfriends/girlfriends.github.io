var psynth = new Tone.PolySynth(12, Tone.FMSynth).toMaster();
psynth.volume.value = -12;
psynth.set("harmonicity", 1.0);
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
psynth2.volume.value = -6;
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
var chorus = new Tone.Distortion(0.3);
var filt = new Tone.AutoFilter("2n").toMaster().start();
filt.wet.value = 0.8;
filt.filter.Q.value = 2;
psynth2.connect(trem);
trem.connect(chorus);
chorus.connect(filt);
var mid = 2;

// psynth.connect(feedbackDelay);

var pat1 = new Tone.Pattern(function(time, note){
  mid = note;
}, [5, 5, 3, 2], "up");
pat1.humanize = true;
pat1.interval = "4n";
pat1.start("4n");

var pat2 = new Tone.Pattern(function(time, note){
  psynth2.triggerAttackRelease(Tone.Frequency(note).transpose(-12 + 0), "8n", time);
  psynth2.triggerAttackRelease(Tone.Frequency(note).transpose(-12 + mid), "8n", time);
  psynth2.triggerAttackRelease(Tone.Frequency(note).transpose(-12 + 5), "8n", time);
  psynth2.triggerAttackRelease(Tone.Frequency(note).transpose(-12 + 5), "8n", time + 0.8);

}, [
	Tone.Frequency(67, "midi"),
	Tone.Frequency(67, "midi"),
	Tone.Frequency(67, "midi"),
	Tone.Frequency(67, "midi"),
	Tone.Frequency(63, "midi"),
	Tone.Frequency(63, "midi"),
	Tone.Frequency(63, "midi"),
	Tone.Frequency(63, "midi"),
	Tone.Frequency(65, "midi"),
	Tone.Frequency(65, "midi"),
	Tone.Frequency(65, "midi"),
	Tone.Frequency(65, "midi"),
	Tone.Frequency(62, "midi"),
	Tone.Frequency(62, "midi"),
	Tone.Frequency(62, "midi"),
	Tone.Frequency(62, "midi"),], "up");
pat2.humanize = false;
pat2.interval = "4n";
pat2.start("4n");

var pat3 = new Tone.Pattern(function(time, note){
  psynth.triggerAttackRelease(Tone.Frequency(note).transpose(5), "8n", time);
  psynth.triggerAttackRelease(Tone.Frequency(note).transpose(8), "8n", time + 0.4);
}, [
	Tone.Frequency(67, "midi"),
	Tone.Frequency(67, "midi"),
	Tone.Frequency(67, "midi"),
	Tone.Frequency(67, "midi"),
	Tone.Frequency(60, "midi"),
	Tone.Frequency(60, "midi"),
	Tone.Frequency(60, "midi"),
	Tone.Frequency(60, "midi"),], "up");
pat3.humanize = false;
pat3.interval = "4n";
// pat3.start(0.65);

// Tone.Transport.loopEnd = '2m';
// Tone.Transport.loop = true;
Tone.Transport.bpm.value = 28;
Tone.Transport.start();