var psynth = new Tone.PolySynth(8, Tone.FMSynth);
psynth.volume.value = -24;
psynth.set("harmonicity", 1);
psynth.set("modulationIndex", 1);
psynth.set({
	envelope: {
		attack: 0.2,
		decay: 0.3,
		sustain: 0.2,
		release: 0.2
	}
});

var pat1 = new Tone.Pattern(function(time, note){
  psynth.triggerAttackRelease(note, "16n", time);
}, [
	Tone.Frequency(72, "midi"),
	Tone.Frequency(74, "midi"),
	Tone.Frequency(79, "midi"),
	Tone.Frequency(81, "midi"),
	Tone.Frequency(74, "midi"),
	Tone.Frequency(72, "midi"),
	Tone.Frequency(74, "midi"),
	Tone.Frequency(84, "midi")], "upDown");
pat1.humanize = true;
pat1.interval = "16n";
pat1.start(0.25);

var pat2 = new Tone.Pattern(function(time, note){
  psynth.triggerAttackRelease(note, "16n", time);
}, [
	Tone.Frequency(48, "midi"),
	Tone.Frequency(50, "midi"),
	Tone.Frequency(46, "midi")], "upDown");
pat2.humanize = true;
pat2.interval = "2n";
pat2.start(0.25);

var filt1 = new Tone.Filter(650, "bandpass");
filt1.Q = 8;
filt1.gain = 1;
var filt2 = new Tone.Filter(1080, "bandpass");
filt2.Q = 11;
filt2.gain = -6;
var filt3 = new Tone.Filter(2650, "bandpass");
filt3.Q = 20;
filt3.gain = -7;
var filt4 = new Tone.Filter(2900, "bandpass");
filt4.Q = 25;
filt4.gain = -8;
var filt5 = new Tone.Filter(3250, "bandpass");
filt5.Q = 30;
filt5.gain = -22;

var trem = new Tone.Tremolo(0.4, 0.2).start();
trem.spread.value = 25;
var verb = new Tone.Freeverb();
var feedbackDelay = new Tone.FeedbackDelay("8n", 0.5);
verb.roomSize.value = 0.8;
verb.dampening.value = 450;
verb.wet.value = 0.5;
var lim = new Tone.Limiter().toMaster();

// psynth.triggerAttack(68, 0, 12);
psynth.connect(filt1);
psynth.connect(filt2);
psynth.connect(filt3);
psynth.connect(filt4);
psynth.connect(filt5);
filt1.connect(verb);
filt2.connect(verb);
filt3.connect(verb);
filt4.connect(verb);
filt5.connect(verb);
verb.connect(trem);
trem.connect(feedbackDelay);
feedbackDelay.connect(lim);

Tone.Transport.loopEnd = '2m';
Tone.Transport.loop = true;
Tone.Transport.bpm.value = 20;
Tone.Transport.start();