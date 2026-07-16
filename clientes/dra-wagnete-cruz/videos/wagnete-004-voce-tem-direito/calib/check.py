from PIL import Image, ImageDraw
import numpy as np, os
base=os.path.dirname(__file__)
masks=[np.array(Image.open(os.path.join(base,f"mask_{t}.png")).convert("RGBA"))[:,:,3] for t in (15,50,85)]
H,W=masks[0].shape
al=np.maximum.reduce(masks); subj=al>128
width=np.zeros(H,int)
for y in range(H):
    xs=np.where(subj[y])[0]
    if xs.size>20: width[y]=xs.max()-xs.min()
present=width>40
head_top=int(np.argmax(present))
# largura máx do cabelo perto do topo da cabeça
hair_max=int(width[head_top:head_top+260].max())
# pescoço = mínimo local de largura depois do cabelo (faixa head_top+150..+520)
seg=width[head_top+150:head_top+520]
neck_rel=int(np.argmin(seg)); neck_y=head_top+150+neck_rel
face_bottom=neck_y+25
ST,SB,SL,SR=160,1344,60,960
LEG_TOP=1040
card_top=face_bottom+45            # cards começam abaixo do queixo
print(f"head_top={head_top} hair_max={hair_max} neck_y={neck_y} FACE_BOTTOM={face_bottom}")
print(f"TOP_BAND y[{ST},{head_top-15}] altura={head_top-15-ST}")
print(f"CARD slot y[{card_top},{LEG_TOP}] altura={LEG_TOP-card_top} ({'OK' if LEG_TOP-card_top>=120 else 'APERTADO'})")
# desenhar caixas propostas no frame
ov=Image.open(os.path.join(base,"f_50.png")).convert("RGBA"); d=ImageDraw.Draw(ov,"RGBA")
# rosto (vermelho)
xs=np.where(subj[head_top:face_bottom].any(axis=0))[0]
d.rectangle([int(xs.min())-20,head_top,int(xs.max())+20,face_bottom],outline=(255,40,40,255),width=7)
# top band elementos (verde) em ~y190..280
d.rectangle([SL,190,SR,285],outline=(40,210,110,255),width=5)
d.text((SL+8,193),"TOPO: icones / timeline / contraste",fill=(40,210,110,255))
# cards id/stat (amarelo) no slot abaixo do queixo
ch=92
d.rectangle([SL,card_top,SL+300,card_top+ch],outline=(255,205,40,255),width=6)
d.text((SL+8,card_top+4),"id / stat / processo / docs",fill=(255,205,40,255))
# legenda (azul)
d.rectangle([SL,LEG_TOP,884,1330],outline=(70,150,255,220),width=4)
d.text((SL+8,LEG_TOP+4),"LEGENDA",fill=(70,150,255,255))
ov.save(os.path.join(base,"check.png")); print("salvo calib/check.png")
