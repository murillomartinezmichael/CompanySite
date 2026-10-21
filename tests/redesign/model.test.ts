import {describe,it,expect} from 'vitest';
import {moneyToCents,quantityValue,completeSum,netEquity,reconciliation,positionEstimate,repaymentSchedule,monthlyOwnerCommitment,personalNetWorthAssets,contributionTotals,flowAdjustedChange,selectObservation,dailyHistory,combineHistory,isStale,validateActivity,appendActivity,activityCsv,validateGoal} from '../../src/lib/finance/model';
import {makeFixture,makeActivity} from './fixtures.mjs';

describe('Finance arithmetic and separation — synthetic records only',()=>{
 it.each([['0',0],['1.2',120],['10.05',1005],['999.99',99999]])('parses %s into exact integer cents',(value,result)=>expect(moneyToCents(value)).toBe(result));
 it.each(['-1','1.001','1e3','NaN','',' 10','1,000'])('rejects ambiguous amount %s',value=>expect(()=>moneyToCents(value)).toThrow());
 it('uses unit prices rather than treating them as position totals',()=>expect(quantityValue('5.2',8000)).toBe(41600));
 it('rounds fractional positions once to cents',()=>expect(quantityValue('1.2345',123)).toBe(152));
 it('rejects excess quantity precision',()=>expect(()=>quantityValue('1.1234567890123',100)).toThrow());
 it('propagates unknown amounts instead of treating them as zero',()=>expect(completeSum([100,null,200])).toBeNull());
 it('treats an empty collection as unavailable',()=>expect(completeSum([])).toBeNull());
 it('keeps a verified zero distinct from unknown',()=>expect(completeSum([0,0])).toBe(0));
 it('rejects an unsafe total',()=>expect(completeSum([Number.MAX_SAFE_INTEGER,1])).toBeNull());
 it('calculates gross assets minus margin once',()=>expect(netEquity(640000,1500,8500,250000)).toBe(400000));
 it('does not deduct the deficit warning again',()=>{const a=makeFixture().accounts[0];expect(a.deficitCents).toBe(8000);expect(reconciliation(a)).toEqual({calculatedCents:400000,differenceCents:0});});
 it('requires known cash for an equity reconciliation',()=>expect(netEquity(10000,0,null,0)).toBeNull());
 it('does not price an unverified security',()=>expect(positionEstimate(makeFixture().accounts[0].holdings[1])).toBeNull());
 it('does not use investor-managed assets as personal wealth',()=>expect(personalNetWorthAssets(makeFixture().accounts)).toBeNull());
 it('sums individual CDs exactly',()=>expect(completeSum(makeFixture().cds.map(c=>c.balanceCents))).toBe(92521));
 it('keeps metal inventory and recorded cost separate',()=>{const s=makeFixture().silver;expect(completeSum(s.map(v=>v.quantity))).toBe(72);expect(completeSum(s.map(v=>v.recordedCostCents))).toBe(226050);expect(s[1].weightVerified).toBe(false);});
 it('builds a proposal, not twelve paid transactions',()=>{const schedule=repaymentSchedule(90000,7500);expect(schedule).toHaveLength(12);expect(schedule.every(p=>p.status==='proposed'&&p.startDate===null)).toBe(true);expect(completeSum(schedule.map(p=>p.amountCents))).toBe(90000);});
 it('makes the final payment no greater than the remainder',()=>expect(repaymentSchedule(10001,5000).map(p=>p.amountCents)).toEqual([5000,5000,1]));
 it('does not include investor contributions in owner commitments',()=>{const s=makeFixture();expect(monthlyOwnerCommitment(s.contributionPlan.ownerMonthlyCents,s.obligations)).toBe(22500);});
 it('excludes unresolved and unscheduled obligations from the scheduled monthly sum',()=>{const s=makeFixture();s.obligations[2].monthlyCents=9900;expect(monthlyOwnerCommitment(15000,s.obligations)).toBe(22500);});
 it('attributes contributions to the right person',()=>{const s=makeFixture();expect(contributionTotals(s.activity,'example-owner')).toBe(15000);expect(contributionTotals(s.activity,'example-investor')).toBe(15000);});
 it('does not classify deposits as investment gains',()=>expect(flowAdjustedChange(100000,130000,30000,0,true)).toBe(0));
 it('does not fabricate performance when cash-flow coverage is incomplete',()=>expect(flowAdjustedChange(100000,130000,0,0,false)).toBeNull());
});

describe('Truthful history and freshness',()=>{
 it('keeps a single observation as one point',()=>expect(dailyHistory(makeFixture().accounts[1].history)).toHaveLength(1));
 it('preserves gaps without fake zero values',()=>{const points=dailyHistory(makeFixture().accounts[0].history);expect(points.find(p=>p.date==='2026-10-02')?.valueCents).toBeNull();expect(points).toHaveLength(16);});
 it('uses the later same-day observation but retains both source records',()=>{const s=makeFixture();const h=s.accounts[0].history;expect(h).toHaveLength(5);expect(dailyHistory(h).at(-1)?.valueCents).toBe(400000);expect(h).toHaveLength(5);});
 it('does not overwrite a newer confirmed snapshot with older provider data',()=>{const current=makeFixture().accounts[0].history.at(-1)!;const incoming={...current,observedAt:'2026-10-15T16:00:00Z',sourceType:'provider' as const,userConfirmed:false,valueCents:1};expect(selectObservation(current,incoming).selected).toBe(current);expect(selectObservation(current,incoming).accepted).toBe(false);});
 it('protects user confirmation at the same timestamp',()=>{const current=makeFixture().accounts[0].history.at(-1)!;expect(selectObservation(current,{...current,userConfirmed:false,valueCents:1}).accepted).toBe(false);});
 it('does not fill missing Canadian observations with American values',()=>{const s=makeFixture();const combined=combineHistory(s.silver.map(v=>dailyHistory(v.history)));expect(combined.find(p=>p.date==='2026-10-03')?.valueCents).toBeNull();expect(combined.at(-1)?.valueCents).toBe(232200);});
 it.each([[null,true],['2026-10-16T16:00:00Z',true],['2026-10-19T16:00:00Z',false]])('handles freshness %s',(at,result)=>expect(isStale(at as string|null,'2026-10-19T17:00:00Z')).toBe(result));
 it('does not manufacture an unavailable source history',()=>expect(dailyHistory([])).toEqual([]));
});

describe('Activity, imports and proposed goals',()=>{
 it('accepts a complete source-attributed purchase',()=>expect(validateActivity(makeActivity(),makeFixture()).quantity).toBe('1.25'));
 it.each([{accountId:'retirement-not-this-brokerage'},{contributorId:'unknown-person'},{identityVerified:false},{quantity:null},{quantity:'-1'},{feesCents:-1},{amountCents:1.1},{sourceRef:''},{date:'2026-02-31'},{date:'2099-01-01'},{symbol:'unknown symbol'},{requestId:'bad'}])('rejects an invalid purchase %j',change=>expect(()=>validateActivity(makeActivity(change as any),makeFixture())).toThrow());
 it('requires the direction of interest',()=>expect(()=>validateActivity(makeActivity({kind:'interest',cashDirection:'none'}),makeFixture())).toThrow());
 it('requires an actual obligation for a repayment',()=>expect(()=>validateActivity(makeActivity({kind:'repayment',obligationId:null}),makeFixture())).toThrow());
 it('accepts a repayment without pretending it is a contribution',()=>{const s=makeFixture();const a=validateActivity(makeActivity({kind:'repayment',obligationId:'cd-obligation'}),s);expect(contributionTotals([a],'example-owner')).toBe(0);});
 it('requires a correction to point to an existing record in the same account',()=>expect(()=>validateActivity(makeActivity({kind:'correction',correctsId:'missing'}),makeFixture())).toThrow());
 it('retains the original record when a correction is appended',()=>{const s=makeFixture();const correction=validateActivity(makeActivity({kind:'correction',correctsId:s.activity[0].id}),s);const result=appendActivity(s.activity,correction);expect(result.rows).toHaveLength(3);expect(result.rows[0]).toBe(s.activity[0]);});
 it('does not add a duplicate import twice',()=>{const a=makeActivity();const one=appendActivity([],a);const two=appendActivity(one.rows,{...a,id:'different-id'});expect(two.duplicate).toBe(true);expect(two.rows).toHaveLength(1);});
 it('deduplicates the same receipt with a new request ID',()=>{const a=makeActivity();expect(appendActivity([a],{...a,requestId:'new-request-001'}).duplicate).toBe(true);});
 it('rejects an idempotency key reused for different content',()=>{const a=makeActivity();expect(()=>appendActivity([a],{...a,amountCents:20000})).toThrow();});
 it('escapes spreadsheet formula injection in CSV exports',()=>{const a=makeActivity({sourceRef:'=HYPERLINK("https://invalid.example")'});expect(activityCsv([a])).toContain("\"'=HYPERLINK");});
 it('leaves unknown goal costs and dates null',()=>{const s=makeFixture();expect(validateGoal({id:'school',targetCents:null,savedCents:null,targetDate:null},s).targetCents).toBeNull();});
 it('does not invent a new goal through a partial update',()=>expect(()=>validateGoal({id:'missing',targetCents:null,savedCents:null,targetDate:null},makeFixture())).toThrow());
 it.each([{targetCents:-1},{savedCents:0.5},{targetDate:'2026-02-31'}])('rejects invalid goal data %j',change=>expect(()=>validateGoal({id:'school',targetCents:null,savedCents:null,targetDate:null,...change},makeFixture())).toThrow());
});
