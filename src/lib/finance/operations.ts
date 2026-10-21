/** Private operational records. Only schemas live in public source; records are
 * fetched through the independently authorized encrypted finance store. */
export interface PrivateProject {
 id:string;
 name:string;
 owner:string;
 status:string;
 category:string;
 description:string;
 nextAction:string;
 sourceRef:string;
 reviewedAt:string|null;
 media:Array<{title:string;kind:'workflow'|'overview'|'output';privateAssetId:string|null;captionRef:string|null}>;
}
export interface PrivateWorkstream {
 id:string;
 name:string;
 owner:string;
 status:string;
 capitalCents:number|null;
 monthlyCents:number|null;
 sourceRef:string;
 observedAt:string|null;
 readinessGate:string;
}
export interface OperationsRecords {
 sourceRef:string;
 asOf:string|null;
 projects:PrivateProject[];
 workstreams:PrivateWorkstream[];
}
