from PIL import Image, ImageDraw
import numpy as np, os
base=os.path.dirname(__file__)
masks=[np.array(Image.open(os.path.join(base,f"mask_{t}.png")).convert("RGBA"))[:,:,3] for t in (15,50,85)]
H,W=masks[0].shape
al=np.maximum.reduce(masks)
subj=al>128
width=np.zeros(H,int); left=np.full(H,-1); right=np.full(H,-1)
for y in range(H):
    xs=np.where(subj[y])[0]
    if xs.size>20: left[y],right[y],width[y]=xs.min(),xs.max(),xs.max()-xs.min()
present=width>40
head_top=int(np.argmax(present)) if present.any() else 0
shoulder_y=H
for y in range(head_top,H):
    if width[y]>460: shoulder_y=y; break
fy0,fy1=max(0,head_top-10),min(H,shoulder_y+30)
xs=np.where(subj[fy0:fy1].any(axis=0))[0]
fx0,fx1=max(0,int(xs.min())-30),min(W,int(xs.max())+30)
ST,SB,SL,SR=160,1344,60,960
top_h=(head_top-15)-ST
print(f"frame {W}x{H}")
print(f"head_top={head_top}  shoulder_y={shoulder_y}")
print(f"FACE_BOX  x[{fx0},{fx1}] y[{fy0},{fy1}]  (largura {fx1-fx0}, altura {fy1-fy0})")
print(f"TOP_BAND livre acima da cabeça: y[{ST},{head_top-15}]  altura={top_h}px  ({'USAVEL' if top_h>=110 else 'PEQUENA'})")
print(f"cards (banda inferior) ancora ~y970 -> abaixo da face? {shoulder_y < 950}")
# overlay
ov=Image.open(os.path.join(base,"f_50.png")).convert("RGBA")
d=ImageDraw.Draw(ov,"RGBA")
d.rectangle([SL,ST,SR,SB],outline=(70,150,255,200),width=3)              # safe zone (azul)
d.rectangle([fx0,fy0,fx1,fy1],outline=(255,40,40,255),width=7)           # face-box (vermelho)
if top_h>=110: d.rectangle([SL,ST,SR,head_top-15],outline=(40,210,110,255),width=6)  # top band (verde)
d.rectangle([SL,980,SR,1330],outline=(255,200,40,255),width=6)          # banda cards/legenda (ambar)
ov.save(os.path.join(base,"overlay.png"))
print("overlay salvo: calib/overlay.png")
