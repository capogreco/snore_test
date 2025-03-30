document.body.style.margin   = 0
document.body.style.overflow = `hidden`

const cnv = document.getElementById (`cnv_element`)
cnv.style.background = `tomato`

onresize = () => {
   cnv.width = innerWidth
   cnv.height = innerHeight   
}

onresize ()

const ctx = cnv.getContext (`2d`)

const draw_frame = () => {

   ctx.fillStyle = `turquoise`
   ctx.fillRect (0, 0, innerWidth, innerHeight)

   requestAnimationFrame (draw_frame)

   if (!a.is_built) return

   const data = new Uint8Array (a.analyser.frequencyBinCount)
   a.analyser.getByteFrequencyData (data)

   const w = cnv.width / data.length
   ctx.fillStyle = `hotpink`

   for (let i = 0; i < data.length; i++) {
      const h = data[i] / 255 * cnv.height
      ctx.fillRect (i * w, cnv.height - h, w, h)
   }
}

const a = { 
   is_built: false
}

const midi_to_freq = note => 440 * 2 ** ((note - 69) / 12)

const build_graph = async () => {
   const freq = midi_to_freq (36)

   a.ctx = new AudioContext ()

   await a.ctx.audioWorklet.addModule (`worklets/pink_noise.js`)
   a.noise = new AudioWorkletNode (a.ctx, `pink_noise`)

   a.noise_amp = a.ctx.createGain ()
   a.noise_amp.gain.value = freq / 2
   a.noise.connect (a.noise_amp)

   a.osc = a.ctx.createOscillator ()
   a.osc.type = `sawtooth`
   a.osc.frequency.value = freq
   a.noise_amp.connect (a.osc.frequency)

   a.amp = a.ctx.createGain ()
   a.amp.gain.value = 0

   a.osc.connect (a.amp)
   
   a.analyser = a.ctx.createAnalyser ()
   a.analyser.fftSize = 2048
   a.amp.connect (a.analyser)
   a.analyser.connect (a.ctx.destination)

   const t = a.ctx.currentTime
   a.osc.start ()
   a.amp.gain.linearRampToValueAtTime (0.05, t + 0.1)

   a.is_built = true
}

cnv.onpointerdown = () => {
   if (!a.is_built) {
      build_graph ()
      draw_frame ()
      return
   }

   const t = a.ctx.currentTime
   const v = a.amp.gain.value ? 0 : 0.05
   a.amp.gain.linearRampToValueAtTime (v, t + 0.1)
}
