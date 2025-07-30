import type { NewValueConfig } from '../types';
declare function toSemverRange(range: string): string | null;
declare function getNewValue({ currentValue, newVersion }: NewValueConfig): string;
export { toSemverRange, getNewValue };
