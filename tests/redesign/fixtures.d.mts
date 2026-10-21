import type {FinanceState,Activity} from '../../src/lib/finance/model';
export const FIXTURE_MARKER:string;
export function makeFixture():FinanceState;
export function makeActivity(changes?:Partial<Activity>):Activity;
