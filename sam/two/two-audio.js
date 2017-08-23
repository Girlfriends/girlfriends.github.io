var synth1 = new Tone.FMSynth();
synth1.modulationIndex.value = 5;
synth1.harmonicity.value = 2;
synth1.volume.value = -24;
synth1.envelope.attack = 1.0;
synth1.envelope.sustain = 0.5;
synth1.envelope.decay = 2.5;

var synth2 = new Tone.FMSynth();
synth2.modulationIndex.value = 5;
synth2.harmonicity.value = 1;
synth2.volume.value = -24;
synth2.envelope.sustain = 0.5;
synth2.envelope.decay = 5.0;

var chorus = new Tone.Chorus(0.664, 2.5, 0.2);
var filt = new Tone.AutoFilter("8n").toMaster();
synth1.connect(chorus);
chorus.connect(filt);

var seq1 = new Tone.Sequence(function(time, note) {
	synth1.triggerAttackRelease(note, "2n", time);
}, [["C#5", "B4", "B3", "B2"], "F#5", "C#5"], "1m");

seq1.humanize = true;
seq1.start(0);

var seq2 = new Tone.Sequence(function(time, note) {
	synth2.triggerAttackRelease(note, "2n", time);
}, ["C#2", "C#3"], "2m");

var filt2 = new Tone.AutoFilter("1n");
var feeb = new Tone.FeedbackDelay("2n", 0.75).toMaster();
synth2.connect(filt2);
filt2.connect(feeb);

seq2.humanize = true;
seq2.start(0);

Tone.Transport.loop = true;
Tone.Transport.loopEnd = "4m";
Tone.Transport.bpm.value = 122;
Tone.Transport.start();
