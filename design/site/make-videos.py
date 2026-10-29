import sys, subprocess
from PIL import Image
S='/tmp/claude-0/-home-user/0a3e77d5-0b3d-5e74-892c-14d35a14251c/scratchpad/'
OUT=S+'sitedesign/media/'
FPS=30; SEG=3.6; FADE=0.5
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
def seg_frames(img,size,n):
    W,H=size
    im=Image.open(img if img.startswith('/') else S+img).convert('RGB'); im=im.resize((W,int(im.height*W/im.width)),Image.LANCZOS)
    out=[]
    for k in range(n):
        t=k/(n-1); e=t*t*(3-2*t)
        if im.height>H+8:
            y=int((im.height-H)*e); out.append(im.crop((0,y,W,y+H)))
        else:
            z=1+0.05*e; w2,h2=int(W/z),int(min(H,im.height)/z)
            f=Image.new('RGB',(W,H),(42,42,44)); f.paste(im,(0,(H-im.height)//2))
            x0=(W-w2)//2; y0=(H-h2)//2; out.append(f.crop((x0,y0,x0+w2,y0+h2)).resize((W,H),Image.LANCZOS))
    return out
for name,(size,imgs) in V.items():
    if len(sys.argv)>1 and name not in sys.argv[1:]: continue
    seg=SEG if len(imgs)>1 else 9.0
    segs=[seg_frames(i,size,int(seg*FPS)) for i in imgs]
    nf=int(FADE*FPS); frames=[]
    if len(segs)==1:
        s=segs[0]; frames=s+s[::-1]   # down then back up: seamless loop
    else:
        for i,s in enumerate(segs):
            nxt=segs[(i+1)%len(segs)]
            frames+=s[nf:-nf]
            for k in range(nf): frames.append(Image.blend(s[-nf+k],nxt[k],(k+1)/nf))
    p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{size[0]}x{size[1]}','-r',str(FPS),'-i','-','-c:v','libx264','-preset','slow','-crf','30','-pix_fmt','yuv420p','-movflags','+faststart','-an',OUT+name+'.mp4'],stdin=subprocess.PIPE)
    for f in frames: p.stdin.write(f.tobytes())
    p.stdin.close(); p.wait()
    frames[0].save(OUT+name+'.jpg',quality=82)
    print(name,len(frames)/FPS,'s')
