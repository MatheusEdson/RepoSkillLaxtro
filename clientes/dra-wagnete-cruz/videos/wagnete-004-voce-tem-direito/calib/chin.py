from PIL import Image
import numpy as np
LEG_TOP_FRAC=1040/1920   # legenda começa nesse fração (top:1040px)
for tag in ("f1","f2"):
    a=np.array(Image.open(f"calib/m_{tag}.png").convert("RGBA"))[:,:,3]
    H,W=a.shape; subj=a>128
    width=np.array([ (np.where(subj[y])[0].max()-np.where(subj[y])[0].min()) if subj[y].sum()>8 else 0 for y in range(H)])
    pres=width>30; head_top=int(np.argmax(pres))
    # queixo ~ onde a largura cresce de novo (rosto->ombros) depois de um mínimo abaixo da cabeça
    seg=width[head_top+60:head_top+330]
    neck=head_top+60+int(np.argmin(seg))
    # normalizar pra 1920
    s=1920/H
    chin=neck*s; legtop=LEG_TOP_FRAC*1920
    print(f"{tag}: H={H} head_top={int(head_top*s)} queixo~{int(chin)}  legenda_top={int(legtop)}  GAP queixo->legenda={int(legtop-chin)}px")
