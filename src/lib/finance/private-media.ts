/** Runtime-only links to the protected same-origin media endpoint. The object
 * IDs come from authorized private records, never from public build fixtures. */
export async function mountPrivateMedia(root:HTMLElement):Promise<void>{
 const nodes=[...root.querySelectorAll<HTMLElement>('[data-private-media-id]')];if(!nodes.length)return;
 try{
  const response=await fetch('/api/workspace/readiness',{credentials:'same-origin',cache:'no-store',redirect:'error'});
  if(!response.ok)return;const status=await response.json();if(status.mediaConfigured!==true||!root.isConnected)return;
  for(const node of nodes){const id=node.dataset.privateMediaId;if(!id||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(id))continue;
   const a=document.createElement('a');a.className='m3-link';a.href='/api/workspace/media/'+encodeURIComponent(id)+'?download=1';a.textContent='Download private file';a.rel='noreferrer';node.replaceChildren(a);
  }
 }catch{ /* Unavailable readiness leaves protected links disabled. */ }
}
