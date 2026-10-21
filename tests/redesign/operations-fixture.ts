import type {OperationsRecords} from '../../src/lib/finance/operations';
/** Entirely synthetic operational inventory; no real projects or investors. */
export function operationsFixture():OperationsRecords{return{
 sourceRef:'Synthetic operations acceptance record',asOf:new Date().toISOString(),
 projects:[{id:'synthetic-catalog-project',name:'Synthetic private project',owner:'Existing synthetic execution owner',status:'Parked — needs original owner review',category:'Internal tool',description:'A synthetic record for testing lossless project ownership.',nextAction:'Review with the original execution owner; no release authorized.',sourceRef:'Synthetic source record 001',reviewedAt:null,media:[{title:'Synthetic overview reference',kind:'overview',privateAssetId:'synthetic-private-media',captionRef:null}]}],
 workstreams:[{id:'synthetic-storage-workstream',name:'Synthetic storage workstream',owner:'Existing synthetic operator',status:'Proposed; purchase not approved',capitalCents:null,monthlyCents:null,sourceRef:'Synthetic planning record 001',observedAt:null,readinessGate:'Independent recovery acceptance before any migration.'}]
};}
