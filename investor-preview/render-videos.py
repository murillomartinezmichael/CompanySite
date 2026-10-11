"""Render silent product explainer videos from reviewed text. No footage or TTS."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / 'dist' / 'assets'
WORK = ROOT / '.video-work'
WORK.mkdir(exist_ok=True)
projects = json.loads((ROOT / 'dist' / 'portfolio.json').read_text(encoding='utf-8'))
font_path = 'C:/Windows/Fonts/segoeui.ttf'
bold_path = 'C:/Windows/Fonts/segoeuib.ttf'
palette = json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {palettes} from '../tailwind.config.mjs'; console.log(JSON.stringify(palettes.dark))"],cwd=ROOT,text=True))
bg, fg, dim, blue, lime = palette['ink']['DEFAULT'], palette['bone']['DEFAULT'], palette['bone']['dim'], palette['electric']['DEFAULT'], palette['clay']['DEFAULT']

def wrapped(draw, text, font, width):
    lines, line = [], ''
    for word in text.split():
        candidate = f'{line} {word}'.strip()
        if draw.textlength(candidate,font=font) > width and line:
            lines.append(line)
            line=word
        else:
            line=candidate
    if line:
        lines.append(line)
    return '\n'.join(lines)

def render(p):
    work = WORK / p['slug']
    work.mkdir(exist_ok=True)
    scenes = [
        ('Meet the project', p['name'], p['audience']),
        ('What it does', p['name'], p['description']),
        ('Commercial role • proposed', p['name'], p['path'])
    ]
    for i,(label,title,body) in enumerate(scenes):
        im = Image.new('RGB',(1280,720),bg)
        d = ImageDraw.Draw(im)
        d.rectangle((0,0,16,720),fill=blue if i<2 else lime)
        d.text((72,52),'M3MM',font=ImageFont.truetype(bold_path,30),fill=fg)
        d.text((270,61),'Product overview / not a recorded demo',font=ImageFont.truetype(font_path,21),fill=dim)
        d.line((72,112,1208,112),fill=palette['ink']['line'],width=2)
        d.text((72,159),label,font=ImageFont.truetype(font_path,24),fill=blue)
        title_font=ImageFont.truetype(bold_path,52 if len(title)<28 else 43)
        d.text((72,210),title,font=title_font,fill=fg)
        body_font=ImageFont.truetype(font_path,33)
        text=wrapped(d,body,body_font,1090)
        d.multiline_text((72,312),text,font=body_font,fill=fg,spacing=13)
        d.text((72,579),f"Status: {p['status']}",font=ImageFont.truetype(font_path,23),fill=lime)
        d.text((72,628),'Portfolio snapshot • October 10, 2026 • No revenue or return implied',font=ImageFont.truetype(font_path,19),fill=dim)
        d.text((1140,622),f'{i+1}/3',font=ImageFont.truetype(font_path,22),fill=dim)
        for j in range(3):
            d.rectangle((72+j*382,688,72+j*382+362,693),fill=blue if j<=i else palette['ink']['line'])
        im.save(work/f'{i}.png')
        if i==0:
            im.save(ASSETS/f"{p['slug']}.jpg",quality=88)
    (work/'frames.txt').write_text("file '0.png'\nduration 6\nfile '1.png'\nduration 6\nfile '2.png'\nduration 6\nfile '2.png'\n",encoding='utf-8')
    result=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i','frames.txt','-vf','fps=12','-t','18','-c:v','libx264','-preset','veryfast','-crf','24','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',str(ASSETS/f"{p['slug']}.mp4")],cwd=work,capture_output=True,text=True)
    if result.returncode:
        raise RuntimeError(f"{p['slug']}: {result.stderr}")
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,width,height','-of','json',str(ASSETS/f"{p['slug']}.mp4")],text=True))
    assert abs(float(probe['format']['duration'])-18)<0.1
    assert probe['streams'][0]['width']==1280
    print(f"Verified {p['slug']}: 18s / 1280x720",flush=True)
    return {'slug':p['slug'],'duration':probe['format']['duration'],'bytes':(ASSETS/f"{p['slug']}.mp4").stat().st_size}

if __name__=='__main__':
    with ThreadPoolExecutor(max_workers=2) as executor:
        results=list(executor.map(render,projects))
    (ROOT/'evidence').mkdir(exist_ok=True)
    (ROOT/'evidence/video-verification.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(f'{len(results)} overview videos verified.')
