# Smooth tour videos: 60 fps, sub-pixel motion (no whole-pixel ticks), a short pause on each
# screen, eased scrolling, cross-fades, a seamless loop.
import sys, subprocess
from PIL import Image
S='/tmp/claude-0/-home-user/0a3e77d5-0b3d-5e74-892c-14d35a14251c/scratchpad/'
OUT=S+'sitedesign/media/'
FPS=60; FADE=0.45
L=(1024,720); P=(412,860)
V={
 'fastbootstudio':(L,['m3eshots/ar-02-device.png','m3eshots/ar-01-payload.png','m3eshots/ar-11-phone.png','m3eshots/ar-10-super.png','m3eshots/light-02-device.png']),
 'mobile':(P,['full/ar-device.png','full/ar-flash.png','full/ar-backup.png','full/ar-otg.png']),
 'companion':(P,['full/comp-device.png','full/comp-mods.png','full/comp-log.png','full/comp-backup.png']),
 'nextzygisk':(P,['look/nextzygisk.png']),
 'nextwheel':(P,['look/nextwheel-crop.png']),
 'nextsusfs':(P,['look/nextsusfs.png']),
 'nextcore':((1280,440),['/home/user/nextcore/.github/assets/banner.png']),
}
def ease(t): return t*t*t*(t*(6*t-15)+10)  # smootherstep: no jolt at start or end
def load(img,W):
    im=Image.open(img if img.startswith('/') else S+img).convert('RGB')
    return im.resize((W,round(im.height*W/im.width)),Image.LANCZOS)
def at(im,size,y,z=1.0):
    W,H=size
    # affine sampling: sub-pixel offset y and zoom z around the centre
    cx=(W-W/z)/2; cy=(H-H/z)/2
    return im.transform((W,H),Image.AFFINE,(1/z,0,cx,0,1/z,y+cy),resample=Image.BICUBIC,fillcolor=(42,42,44))
def segment(im,size,secs,hold=0.7,back=False):
    W,H=size; n=int(secs*FPS); travel=max(0,im.height-H)
    frames=[]
    for k in range(n):
        t=k/FPS
        if travel>8:
            if back:  # down, pause, back up: one image loops by itself
                half=secs/2; m=t if t<half else secs-t
                p=ease(min(1,max(0,(m-hold)/(half-hold-0.3))))
            else:
                p=ease(min(1,max(0,(t-hold)/(secs-hold-0.6))))
            frames.append(at(im,size,travel*p))
        else:
            p=ease(t/secs) if not back else ease(1-abs(2*t/secs-1))
            frames.append(at(im,size,0,1+0.04*p))
    return frames
for name,(size,imgs) in V.items():
    if len(sys.argv)>1 and name not in sys.argv[1:]: continue
    ims=[load(i,size[0]) for i in imgs]
    if len(ims)==1:
        frames=segment(ims[0],size,14.0,back=True)
    else:
        segs=[segment(im,size,4.4) for im in ims]; nf=int(FADE*FPS); frames=[]
        for i,s in enumerate(segs):
            nxt=segs[(i+1)%len(segs)]
            frames+=s[nf:-nf]
            for k in range(nf):
                a=ease((k+1)/nf); frames.append(Image.blend(s[-nf+k],nxt[k],a))
    p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{size[0]}x{size[1]}','-r',str(FPS),'-i','-',
        '-c:v','libx264','-preset','slow','-crf','27','-pix_fmt','yuv420p','-g','60','-movflags','+faststart','-an',OUT+name+'.mp4'],stdin=subprocess.PIPE)
    for f in frames: p.stdin.write(f.tobytes())
    p.stdin.close(); p.wait()
    frames[0].save(OUT+name+'.jpg',quality=84)
    print(name,round(len(frames)/FPS,1),'s')
