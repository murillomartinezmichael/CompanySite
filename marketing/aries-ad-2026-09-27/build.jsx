(function () {
  var root = 'C:/Users/Michael/Documents/GitHub/CompanySite/marketing/aries-ad-2026-09-27/';
  var report = new File(root + 'adobe-build.txt');
  try {
    app.beginUndoGroup('M3MM Aries showcase');
    var p = app.project || app.newProject();
    var folder = p.items.addFolder('M3MM Aries 2026-09-27');
    var footage = p.importFile(new ImportOptions(new File(root + '../../public/videos/aries-scroll-v2.mp4')));
    footage.parentFolder = folder;
    var ink = [0.025,0.035,0.045], white = [0.93,0.95,0.94], lime = [0.73,0.98,0.25], muted = [0.65,0.71,0.73];
    function text(c, s, x, y, size, color, start, end) {
      var l = c.layers.addText(s), d = l.property('Source Text').value;
      d.font = 'Arial-BoldMT'; d.fontSize = size; d.fillColor = color;
      d.justification = ParagraphJustification.LEFT_JUSTIFY;
      l.property('Source Text').setValue(d); l.position.setValue([x,y]);
      l.inPoint=start; l.outPoint=end;
      l.opacity.setValueAtTime(start,0); l.opacity.setValueAtTime(start+0.3,100);
      l.opacity.setValueAtTime(end-0.25,100); l.opacity.setValueAtTime(end,0);
      return l;
    }
    function bar(c,x,y,w,h,col) {
      var l=c.layers.addSolid(col,'Accent',w,h,1,18); l.position.setValue([x+w/2,y+h/2]); return l;
    }
    var phone = p.items.addComp('Aries actual website crop',440,960,1,18,30);
    phone.parentFolder=folder;
    var src=phone.layers.add(footage); src.position.setValue([220,480]);
    function make(vertical) {
      var w=vertical?1080:1920,h=vertical?1920:1080;
      var c=p.items.addComp(vertical?'TikTok vertical draft':'Website showcase',w,h,1,18,30);c.parentFolder=folder;
      c.layers.addSolid(ink,'Background',w,h,1,18);
      bar(c,vertical?80:110,vertical?178:150,72,6,lime);
      var ph=c.layers.add(phone); ph.position.setValue(vertical?[510,1010]:[1430,550]);
      ph.scale.setValue(vertical?[108,108]:[92,92]);
      text(c,'M3MM  /  WEBSITE DESIGN',vertical?80:110,vertical?145:116,vertical?28:25,muted,0,18);
      var x=vertical?80:110,y=vertical?265:285,fs=vertical?65:79;
      text(c,'Your work deserves\ra better website.',x,y,fs,white,0,5);
      text(c,'Real project.\rBuilt for the screen.',x,y,fs,white,5,10);
      text(c,'Make your next\rfirst impression count.',x,y,vertical?59:72,white,10,14);
      text(c,'Let\'s build\ryour business site.',x,y,fs,white,14,18);
      text(c,'ARIES OUTDOOR LIVING',x,vertical?1580:535,vertical?31:27,lime,0,14);
      text(c,'Actual website walkthrough',x,vertical?1625:582,vertical?29:30,muted,0,14);
      text(c,'Explore custom websites',x,vertical?1580:535,vertical?34:35,lime,14,18);
      text(c,'m3mm.net/websites',x,vertical?1630:590,vertical?34:36,white,14,18);
      text(c,'AI-assisted design + editing',x,vertical?1700:938,vertical?24:23,muted,0,18);
      var track=bar(c,x,vertical?1740:970,vertical?760:720,4,[0.15,0.20,0.22]);
      var progress=bar(c,x,vertical?1740:970,vertical?760:720,4,lime);
      progress.anchorPoint.setValue([0,2]);progress.position.setValue([x,vertical?1742:972]);
      progress.scale.setValueAtTime(0,[0,100]);progress.scale.setValueAtTime(18,[100,100]);
      var rq=p.renderQueue.items.add(c); var om=rq.outputModule(1);
      var templates=om.templates, chosen='';
      for(var i=0;i<templates.length;i++){if(templates[i].indexOf('H.264')>=0){chosen=templates[i];break;}}
      if(chosen){om.applyTemplate(chosen);om.file=new File(root+(vertical?'aries-tiktok-draft.mp4':'aries-website-showcase.mp4'));}
      else {om.file=new File(root+(vertical?'aries-tiktok-draft.avi':'aries-website-showcase.avi'));}
      return c;
    }
    make(false);make(true);
    p.save(new File(root+'aries-showcase.aep'));
    report.open('w');report.write('SUCCESS\nAfter Effects '+app.version+'\nTwo 18-second, 30fps compositions saved.\n');report.close();
    app.endUndoGroup();
  } catch(e) {report.open('w');report.write('ERROR '+e.toString()+' line '+e.line);report.close();}
})();
