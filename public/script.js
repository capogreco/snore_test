document.body.style.margin   = 0
document.body.style.overflow = `hidden`

const cnv = document.getElementById (`cnv_element`)
cnv.style.background = `tomato`

globalThis.onresize = () => {
   cnv.width = innerWidth
   cnv.height = innerHeight   
}

globalThis.onresize ()

const ctx = cnv.getContext (`2d`)
const draw_frame = () => {
   ctx.fillStyle = `turquoise`
   ctx.fillRect (0, 0, innerWidth, innerHeight)

   requestAnimationFrame (draw_frame)

   if (!graph.is_built) return

   ctx.fillStyle = `hotpink`
   const data = new Uint8Array (graph.analyser.frequencyBinCount)
   graph.analyser.getByteFrequencyData (data)
   const w = cnv.width / data.length
   for (let i = 0; i < data.length; i++) {
      const h = data[i] / 255 * cnv.height
      ctx.fillRect (i * w, cnv.height - h, w, h)
   }

}

const graph = { 
   is_built: false,
   is_playing: false
}

const midi_to_freq = midi => 440 * 2 ** ((midi - 69) / 12)

const build_graph = () => {
   graph.audio = new AudioContext ()

   graph.osc = graph.audio.createOscillator ()
   graph.osc.type = `sawtooth`
   graph.osc.frequency.value = midi_to_freq (46)

   graph.amp = graph.audio.createGain ()
   graph.amp.gain.value = 0
   graph.osc.connect (graph.amp)
   
   graph.analyser = graph.audio.createAnalyser ()
   graph.analyser.fftSize = 2048
   graph.amp.connect (graph.analyser)
   graph.analyser.connect (graph.audio.destination)

   const t = graph.audio.currentTime
   graph.osc.start ()
   graph.amp.gain.linearRampToValueAtTime (0.05, t + 0.1)

   graph.is_built = true
}

cnv.onpointerdown = () => {
   if (!graph.is_built) {
      build_graph ()
      draw_frame ()
      return
   }
   const t = graph.audio.currentTime
   const a = graph.amp.gain.value ? 0 : 0.05
   console.log (graph.amp.gain.value)
   graph.amp.gain.linearRampToValueAtTime (a, t + 0.1)
}
