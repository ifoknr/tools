# ICO from separate PNGs per size (small sizes use the simpler drawing).
import struct, sys
from PIL import Image
sizes = [16, 24, 32, 48, 64, 128, 256]; blobs = [open(f'ico/{s}.png', 'rb').read() for s in sizes]
for s in sizes: assert Image.open(f'ico/{s}.png').size == (s, s), s
head = struct.pack('<HHH', 0, 1, len(sizes)); off = 6 + 16 * len(sizes); ent = b''
for s, b in zip(sizes, blobs):
    ent += struct.pack('<BBBBHHII', s % 256, s % 256, 0, 0, 1, 32, len(b), off); off += len(b)
open(sys.argv[1], 'wb').write(head + ent + b''.join(blobs))
