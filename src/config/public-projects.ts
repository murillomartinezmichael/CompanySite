import {DROPS} from './roadmap';
/** Only the existing approved public release registry feeds public pages. */
export const projectSlug=(name:string)=>name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const PUBLIC_PROJECTS=DROPS.map(drop=>({...drop,slug:projectSlug(drop.name)}));
export const statusLabel=(status:string)=>({released:'Officially released',next:'Next official launch',testing:'Testing preview',upcoming:'Planned'}[status]||'Status unavailable');
