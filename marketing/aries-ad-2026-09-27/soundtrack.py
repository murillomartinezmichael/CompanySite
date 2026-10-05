"""Original procedural instrumental; no samples, voice, or external music."""
import math
import struct
import wave
from pathlib import Path

rate = 44100
duration = 18
chords = [(130.81, 164.81, 196), (110, 130.81, 164.81),
          (87.31, 110, 130.81), (98, 123.47, 146.83)]
audio = bytearray()
peak = 0
for i in range(rate * duration):
    t = i / rate
    beat = 60 / 108
    chord = chords[int(t / (beat * 8)) % 4]
    step = int(t / (beat / 2))
    age = t % (beat / 2)
    freq = chord[step % 3] * 4
    pluck = math.sin(2 * math.pi * freq * t) * math.exp(-age * 14) * min(age * 250, 1)
    pad = sum(math.sin(2 * math.pi * f * t) for f in chord) / 3
    phase = t % beat
    kick = math.sin(2 * math.pi * (48 * phase + 2 * (1 - math.exp(-phase * 30)))) * math.exp(-phase * 18)
    fade = min(t / .6, 1, (duration - t) / 1.2)
    value = fade * (.12 * pluck + .055 * pad + .10 * kick)
    peak = max(peak, abs(value))
    audio.extend(struct.pack('<h', int(value * 32767)))
with wave.open(str(Path(__file__).with_name('original-instrumental.wav')), 'wb') as out:
    out.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
    out.writeframes(audio)
print(f'18 seconds, mono PCM 44.1kHz; peak {20*math.log10(peak):.2f} dBFS')
