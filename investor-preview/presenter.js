(() => {
  const {chapters,pitchIds}=window.M3Presentation;
  const demoChapters=chapters.filter(c=>c.demo);
  const $=id=>document.getElementById(id);
  const dialog=$('presenter'), audio=$('narration-audio'), sceneVideo=$('scene-video');
  if(demoChapters.length){const option=document.createElement('option');option.value='demos';option.textContent=`Software demos · ${demoChapters.length} recordings`;$('tour-mode').append(option);}
  let sequence=pitchIds.map(id=>chapters.find(c=>c.id===id));
  let chapterIndex=0,pointIndex=0,playing=false,completed=false,playToken=0;
  const active=()=>sequence[chapterIndex];
  const media=()=>active().demo?sceneVideo:audio;
  const fail=message=>{$('narration-error').hidden=false;$('narration-error').textContent=message;};
  function controls(){
    $('narration-play').textContent=playing?'Pause narration':completed?'Replay chapter':'Play narration';
    $('narration-top-toggle').textContent=playing?'Pause':'Play';
    $('narration-top-toggle').setAttribute('aria-label',playing?'Pause narration':'Play narration');
    $('chapter-prev').disabled=chapterIndex===0;
    $('chapter-next').disabled=chapterIndex===sequence.length-1;
    $('narration-position').textContent=`· point ${pointIndex+1} of ${active().points.length}`;
    document.querySelectorAll('[data-chapter-index]').forEach(b=>b.setAttribute('aria-current',Number(b.dataset.chapterIndex)===chapterIndex?'step':'false'));
  }
  function stop(){playing=false;playToken++;audio.pause();sceneVideo.pause();controls();}
  async function play(){
    completed=false;playing=true;const token=++playToken;controls();
    try{
      await media().play();
      if(token!==playToken||!dialog.open)return;
      if(!active().demo&&!sceneVideo.hidden)sceneVideo.play().catch(()=>{});
    }catch(e){
      if(token!==playToken)return;
      playing=false;controls();
      fail(active().demo?'This demonstration could not start. Press Play to retry; the spoken script and step details remain readable below.':'Narration could not start. Press Play to retry. The complete spoken text is displayed below.');
    }
  }
  function setPoint(index,shouldPlay){
    playToken++;audio.pause();pointIndex=index;completed=false;
    $('narration-error').hidden=true;
    if(active().demo){audio.removeAttribute('src');sceneVideo.currentTime=active().demo.steps[index].start;}
    else audio.src=`./assets/narration/${active().id}-${pointIndex}.m4a`;
    audio.playbackRate=Number($('narration-rate').value);
    audio.volume=Number($('narration-volume').value);
    sceneVideo.playbackRate=Number($('narration-rate').value);sceneVideo.volume=Number($('narration-volume').value);
    $('narration-text').textContent=active().points[index][1];
    document.querySelectorAll('.talking-point').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    playing=false;controls();
    if(shouldPlay)play();else sceneVideo.pause();
  }
  function artwork(c){
    const box=$('scene-art');box.replaceChildren();
    const heading=document.createElement('strong');
    heading.textContent=c.kind==='budget'?'$2,000':c.kind==='hardware'?'Existing fleet':c.kind==='outcomes'?'Measure. Verify. Demonstrate.':c.kind==='closing'?'Questions welcome.':'M3MM';
    box.append(heading);
    const labels=c.kind==='budget'?['$1,300 compute','$350 recovery','$200 power','$150 contingency']:c.kind==='hardware'?['Windows delivery','Linux development','Local AI server','Two Pi nodes']:c.kind==='outcomes'?['Baseline workloads','Prove a restore','Compare results']:['Modernize.','Mobilize.','Multiply.'];
    for(const text of labels){const item=document.createElement('span');item.textContent=text;box.append(item)}
  }
  function setChapter(index,shouldPlay=playing){
    playToken++;audio.pause();sceneVideo.pause();chapterIndex=index;pointIndex=0;
    const c=active();
    $('chapter-label').textContent=c.label+(c.status?` · ${c.status}`:'');
    $('chapter-count').textContent=`${index+1} / ${sequence.length}`;
    $('chapter-title').textContent=c.title;
    $('chapter-select').value=String(index);
    $('talking-points').replaceChildren();
    for(const [i,[title,text]] of c.points.entries()){
      const button=document.createElement('button');button.type='button';button.className='talking-point';button.dataset.cta='presentation-point';
      const number=document.createElement('span');number.textContent=String(i+1).padStart(2,'0');number.className='point-number';
      const label=document.createElement('strong');label.textContent=title;
      const description=document.createElement('span');description.className='point-summary';description.textContent=text;
      button.append(number,label,description);button.addEventListener('click',()=>setPoint(i,true));$('talking-points').append(button);
      if(c.demo){const detail=document.createElement('details');detail.className='demo-detail';const summary=document.createElement('summary');summary.textContent=`More detail: ${title}`;const p=document.createElement('p');p.textContent=c.demo.steps[i].detail;detail.append(summary,p);detail.addEventListener('toggle',()=>{if(detail.open)stop();});$('talking-points').append(detail);}
    }
    sceneVideo.hidden=!c.video;$('scene-art').hidden=!!c.video;
    sceneVideo.muted=!c.demo;sceneVideo.replaceChildren();dialog.classList.toggle('actual-demo',!!c.demo);
    if(c.video){sceneVideo.src=c.video;sceneVideo.poster=c.poster;sceneVideo.currentTime=0;if(c.demo){const track=document.createElement('track');track.kind='captions';track.srclang='en';track.label='English';track.src=c.demo.captions;sceneVideo.append(track);}}
    else{sceneVideo.removeAttribute('src');sceneVideo.load();artwork(c);}
    $('scene-media-note').textContent=c.demo?c.demo.qualification:c.id==='client-proof'?'Recorded client website walkthrough · existing 20-second clip':c.video?'Captioned product overview · not a recorded app demonstration':'Illustrative presentation · see the narrated qualifications';
    $('scene-live').hidden=!c.url;if(c.url)$('scene-live').href=c.url;else $('scene-live').removeAttribute('href');
    setPoint(0,shouldPlay);
    $('presenter').scrollTop=0;
  }
  function navigation(){
    $('chapter-select').replaceChildren();$('chapter-nav').replaceChildren();
    sequence.forEach((c,i)=>{
      const option=document.createElement('option');option.value=String(i);option.textContent=`${i+1}. ${c.title}`;$('chapter-select').append(option);
      const b=document.createElement('button');b.type='button';b.dataset.chapterIndex=String(i);b.dataset.cta='presentation-chapter';b.textContent=c.title;b.addEventListener('click',()=>setChapter(i));$('chapter-nav').append(b);
    });
  }
  $('start-presentation').hidden=false;
  $('start-presentation').addEventListener('click',()=>{
    sequence=pitchIds.map(id=>chapters.find(c=>c.id===id));$('tour-mode').value='pitch';
    for(const v of document.querySelectorAll('video'))v.pause();
    if($('player').open)$('player').close();
    dialog.showModal();document.body.classList.add('presenting');navigation();setChapter(0,true);
  });
  for(const button of document.querySelectorAll('[data-narrate]')){
    button.hidden=false;
    button.addEventListener('click',()=>{
      for(const v of document.querySelectorAll('video'))v.pause();
      if($('player').open)$('player').close();
      const isDemo=demoChapters.some(c=>c.id===button.dataset.narrate);
      sequence=isDemo?demoChapters:chapters;$('tour-mode').value=isDemo?'demos':'all';navigation();
      dialog.showModal();document.body.classList.add('presenting');
      setChapter(sequence.findIndex(c=>c.id===button.dataset.narrate),true);
    });
  }
  $('presentation-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{stop();audio.removeAttribute('src');audio.load();sceneVideo.removeAttribute('src');sceneVideo.load();document.body.classList.remove('presenting');if(document.fullscreenElement===dialog)document.exitFullscreen().catch(()=>{});});
  $('narration-play').addEventListener('click',()=>{if(playing)stop();else if(completed)setPoint(0,true);else play();});
  $('narration-top-toggle').addEventListener('click',()=>$('narration-play').click());
  $('chapter-prev').addEventListener('click',()=>{if(chapterIndex>0)setChapter(chapterIndex-1)});
  $('chapter-next').addEventListener('click',()=>{if(chapterIndex<sequence.length-1)setChapter(chapterIndex+1)});
  $('chapter-select').addEventListener('change',e=>setChapter(Number(e.target.value)));
  $('tour-mode').addEventListener('change',()=>{sequence=$('tour-mode').value==='all'?chapters:$('tour-mode').value==='demos'?demoChapters:pitchIds.map(id=>chapters.find(c=>c.id===id));navigation();setChapter(0);});
  $('narration-rate').addEventListener('change',()=>{audio.playbackRate=sceneVideo.playbackRate=Number($('narration-rate').value)});
  $('narration-volume').addEventListener('input',()=>{audio.volume=sceneVideo.volume=Number($('narration-volume').value)});
  audio.addEventListener('ended',()=>{
    if(active().demo)return;
    if(!playing||!dialog.open)return;
    if(pointIndex<active().points.length-1)setPoint(pointIndex+1,true);
    else if($('auto-advance').checked&&chapterIndex<sequence.length-1)setChapter(chapterIndex+1,true);
    else{stop();completed=true;controls();}
  });
  sceneVideo.addEventListener('timeupdate',()=>{
    if(!active().demo||!dialog.open)return;
    const index=Math.max(0,active().demo.steps.findLastIndex(s=>s.start<=sceneVideo.currentTime));
    if(index!==pointIndex){pointIndex=index;$('narration-text').textContent=active().points[index][1];document.querySelectorAll('.talking-point').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));controls();}
  });
  sceneVideo.addEventListener('play',()=>{if(active().demo&&dialog.open){playing=true;completed=false;controls();}});
  sceneVideo.addEventListener('pause',()=>{if(active().demo&&dialog.open){playing=false;controls();}});
  sceneVideo.addEventListener('ended',()=>{
    if(!active().demo||!dialog.open)return;
    if($('auto-advance').checked&&chapterIndex<sequence.length-1)setChapter(chapterIndex+1,true);
    else{stop();completed=true;controls();}
  });
  audio.addEventListener('error',()=>{if(dialog.open&&audio.getAttribute('src')){stop();fail('This narration file could not load. You can still read every talking point and move through the presentation.');}});
  sceneVideo.addEventListener('error',()=>{if(dialog.open&&sceneVideo.getAttribute('src')){if(active().demo){stop();fail('This demonstration could not load. Its spoken script and step details remain readable below.');}else fail('This video could not load. Narration and chapter details remain available.');}});
  $('scene-live').addEventListener('click',stop);
  $('presentation-fullscreen').hidden=!document.fullscreenEnabled;
  $('presentation-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await dialog.requestFullscreen();}catch{fail('Full screen is unavailable here. The presentation still works in this window.');}});
  document.addEventListener('fullscreenchange',()=>{$('presentation-fullscreen').textContent=document.fullscreenElement?'Leave full screen':'Full screen'});
  dialog.addEventListener('keydown',e=>{
    if(e.target.closest('input,select,textarea,video,audio'))return;
    if(e.key==='ArrowRight'){e.preventDefault();if(chapterIndex<sequence.length-1)setChapter(chapterIndex+1)}
    if(e.key==='ArrowLeft'){e.preventDefault();if(chapterIndex>0)setChapter(chapterIndex-1)}
    if(e.code==='Space'&&!e.target.closest('button,a')){e.preventDefault();$('narration-play').click();}
  });
})();
