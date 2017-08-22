var synth = new Tone.FMSynth();
synth.modulationIndex.value = 1;
synth.harmonicity.value = 2;
synth.oscillator.type = "sine";
synth.modulation.type = "square";
synth.volume.value = -36;
synth.envelope.sustain = 0.0;
synth.envelope.decay = 1.5;

var freeverb = new Tone.Freeverb();
var feedbackDelay = new Tone.FeedbackDelay("8n", 0.25).toMaster();

freeverb.connect(feedbackDelay);
synth.connect(freeverb);

var seq = new Tone.Sequence(function(time, note){
	synth.triggerAttackRelease(note, "2n", time)
},
	[
		["G4", "B4", "G5", "B4", "D5", "E5"],
		["G4", "B4", "G5", "B4", "D5", "E5"],
		["F#4", "B4", "D5", "C#5", "E5", "D5"],
		["F#4", "B4", "D5", "C#5", "E5", "D5"],
	]
, "1n");

seq.humanize = true;
seq.start(0);
window.synth = synth;

Tone.Transport.loopEnd = '4m';
Tone.Transport.loop = true;
Tone.Transport.bpm.value = 45;
Tone.Transport.start();
