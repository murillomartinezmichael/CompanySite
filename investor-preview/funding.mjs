export function fundingProgress({goalUsd,raisedUsd},id){
  if(!Number.isFinite(goalUsd)||goalUsd<=0)throw Error('Funding goal must be positive');
  if(raisedUsd!==null&&(!Number.isFinite(raisedUsd)||raisedUsd<0))throw Error('Raised funding must be nonnegative or null');
  const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
  const known=raisedUsd!==null;
  const percent=known?Math.min(100,raisedUsd/goalUsd*100):null;
  const label=known?`${money(raisedUsd)} raised of ${money(goalUsd)}`:`${money(goalUsd)} server funding goal`;
  const status=known?(raisedUsd>=goalUsd?'Goal reached':`${money(goalUsd-raisedUsd)} to go`):'Amount raised not yet confirmed';
  return `<div class="funding-progress"><div class="funding-progress-heading"><strong id="${id}-label">${label}</strong><span>${known?`${Math.floor(percent)}% funded`:'Awaiting update'}</span></div><div class="funding-track${known?'':' unconfirmed'}" role="progressbar" aria-labelledby="${id}-label" aria-describedby="${id}-status" aria-valuemin="0" aria-valuemax="${goalUsd}" ${known?`aria-valuenow="${Math.min(raisedUsd,goalUsd)}"`:''} aria-valuetext="${known?`${label}; ${status}`:status}"><span style="width:${percent??0}%"></span></div><p id="${id}-status">${status}</p></div>`;
}
