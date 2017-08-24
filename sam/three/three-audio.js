var synth1 = new Tone.FMSynth();
synth1.volume.value = -18;
var synth2 = new Tone.FMSynth();
synth2.volume.value = -18;
var synth3 = new Tone.FMSynth();
synth3.volume.value = -18;

var mult1 = new Tone.Multiply();

var feeb = new Tone.FeedbackCombFilter();
var auf = new Tone.AutoFilter(0.017).start();
var auf2 = new Tone.AutoFilter(0.0353).start();
var filt = new Tone.Filter(200, "highpass");

var lim = new Tone.Limiter().toMaster();

var lfo1 = new Tone.LFO(0.02, 0.02, 2);
lfo1.type = "sine";
lfo1.connect(synth1.harmonicity);
lfo1.start(0);

var lfo2 = new Tone.LFO(0.0145, 1, 10);
lfo2.type = "sine";
lfo2.connect(synth2.modulationIndex);
lfo2.start(0);

// var lfo3 = new Tone.LFO(0.075, -30, -18);
// lfo3.type = "sine";
// lfo3.connect(synth1.volume);
// lfo3.start(0);

synth1.connect(mult1, 0, 0);
synth2.connect(mult1, 0, 0);
synth3.connect(mult1, 0, 1);
mult1.connect(feeb);
feeb.connect(auf);
feeb.connect(auf2)
auf.connect(filt);
auf2.connect(filt);
filt.connect(lim);

synth1.triggerAttack(45, 0, 12);
synth2.triggerAttack(22, 0, 12);
synth3.triggerAttack(69, 0, 12);

Tone.Transport.start();