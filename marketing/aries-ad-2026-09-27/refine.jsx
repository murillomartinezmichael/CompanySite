(function(){
var root='C:/Users/Michael/Documents/GitHub/CompanySite/marketing/aries-ad-2026-09-27/';
var p=app.open(new File(root+'aries-showcase.aep'));
var music=p.importFile(new ImportOptions(new File(root+'original-instrumental.wav')));
for(var i=1;i<=p.numItems;i++){
 var c=p.item(i);
 if(!(c instanceof CompItem))continue;
 if(c.name==='Aries actual website crop'){c.width=720;c.height=1280;c.layer(1).position.setValue([360,640]);}
 if(c.name==='Website showcase'||c.name==='TikTok vertical draft'){
  var v=c.name==='TikTok vertical draft';
  c.layers.add(music);
  for(var j=1;j<=c.numLayers;j++){
   var l=c.layer(j);
   if(l.source && l.source.name==='Aries actual website crop'){l.scale.setValue(v?[68,68]:[68,68]);l.position.setValue(v?[510,995]:[1430,550]);}
   if(l.property('Source Text')){
    var d=l.property('Source Text').value;
    if(d.text==='AI-assisted design + editing'){d.text='AI-generated music / real website';l.property('Source Text').setValue(d);if(v)l.position.setValue([80,415]);}
    if(v && (d.text==='Explore custom websites'||d.text==='ARIES OUTDOOR LIVING'))l.position.setValue([80,1510]);
    if(v && (d.text==='m3mm.net/websites'||d.text==='Actual website walkthrough'))l.position.setValue([80,1560]);
   }
  }
 }
}
p.save(new File(root+'aries-showcase.aep'));
var f=new File(root+'refinement.txt');f.open('w');f.write('Full source framing; upper disclosure; original instrumental imported.');f.close();
})();
