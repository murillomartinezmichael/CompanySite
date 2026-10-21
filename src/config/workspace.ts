
export const WORKSPACE_VIEWS=[
{slug:'',title:'Finance overview',intro:'Understand the money you manage, what is owed and how current the evidence is.',group:'Overview'},
{slug:'silver',title:'Silver holdings',intro:'Separate American and Canadian inventory, recorded costs and dated estimated metal values.',group:'Assets'},
{slug:'brokerage',title:'Brokerage accounts',intro:'Keep each brokerage separate. Gross assets, margin and net equity are different numbers.',group:'Assets'},
{slug:'brokerage/robinhood',title:'Robinhood',intro:'One managed account. Securities, crypto, margin, net equity and account warnings stay separate.',group:'Assets'},
{slug:'brokerage/fidelity',title:'Fidelity Individual',intro:'The Individual brokerage only—not the retirement account or HSA. Contributor ownership remains distinct.',group:'Assets'},
{slug:'cds',title:'Certificates of deposit',intro:'Review each CD balance and its terms. Unknown dates and rates remain unavailable.',group:'Assets'},
{slug:'investor-ledger',title:'Investor ledger',intro:'Track contributions and reported repayment obligations without confusing ownership, transfers or gains.',group:'Records'},
{slug:'budget-goals',title:'Budget & goals',intro:'Separate confirmed contributions, proposed repayments and future goals. This is not an affordability approval.',group:'Planning'},
{slug:'activity',title:'Activity',intro:'Record what happened, when, in which account and whose money funded it. Recording does not move money.',group:'Records'},
{slug:'operations',title:'Operations',intro:'Keep internal project delivery, infrastructure planning and operating details out of the public company website.',group:'Planning'},
{slug:'operations/infrastructure',title:'Internal infrastructure',intro:'Private readiness gates, system budgets and operating costs belong here after approved import.',group:'Planning'},
{slug:'operations/catalog',title:'Internal project catalog',intro:'Preserve the wider portfolio, demonstrations, project owners and release gates without republishing unapproved details.',group:'Planning'}
];
export const workspaceHref=(slug:string)=>'/workspace'+(slug?'/'+slug:'');
