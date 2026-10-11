const projects = [...document.querySelectorAll('.project')];
const search = document.querySelector('#search');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
let category = 'All';
function filter() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  for (const project of projects) {
    project.hidden = !((category === 'All' || project.dataset.category === category) && project.dataset.search.includes(query));
    if (!project.hidden) visible++;
  }
  document.querySelector('#result-count').textContent = `${visible} of ${projects.length} projects`;
  document.querySelector('#empty').hidden = visible !== 0;
}
document.querySelector('.filters').hidden = false;
search.addEventListener('input',filter);
for(const button of filterButtons) button.addEventListener('click',()=>{
  category=button.dataset.filter;
  for(const item of filterButtons) item.setAttribute('aria-pressed',String(item===button));
  filter();
});
function reset(){search.value='';category='All';filterButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter==='All')));filter()}
document.querySelector('#reset').addEventListener('click',reset);
function showHash(){
  const id=location.hash.slice(1);
  const project=projects.find(p=>p.id===id);
  if(project){reset();document.querySelector('.all-projects').open=true;project.querySelector('details').open=true;project.scrollIntoView();}
}
window.addEventListener('hashchange',showHash);
for(const anchor of document.querySelectorAll('a[href^="#"]')) anchor.addEventListener('click',()=>{
  if(anchor.hash===location.hash)showHash();
});
showHash();
const player=document.querySelector('#player');
const video=document.querySelector('#player-video');
const error=document.querySelector('#player-error');
for(const button of document.querySelectorAll('[data-project]')){
  button.hidden=false;
  button.addEventListener('click',()=>{
    const project=document.getElementById(button.dataset.project);
    const inline=project.querySelector('video');
    document.querySelector('#player-title').textContent=project.querySelector('.project-name').firstChild.textContent;
    document.querySelector('#player-description').textContent=project.querySelector('.project-one-line').textContent;
    error.hidden=true;
    video.poster=inline.poster;
    video.src=inline.querySelector('source').src;
    player.showModal();
    // Explicit native play control: no autoplay, including after opening.
  });
}
document.querySelector('#close-player').addEventListener('click',()=>player.close());
player.addEventListener('close',()=>{video.pause();video.removeAttribute('src');video.load()});
video.addEventListener('error',()=>{error.hidden=false});
for(const inline of document.querySelectorAll('.project video')){
  inline.querySelector('source').addEventListener('error',()=>{inline.parentElement.querySelector('.video-error').hidden=false});
  inline.closest('details').addEventListener('toggle',e=>{if(!e.target.open)inline.pause()});
  inline.addEventListener('play',()=>{for(const other of document.querySelectorAll('video'))if(other!==inline)other.pause()});
}
