import type { Preset, PresetConfig } from '../types';
export declare const groups: Record<string, Record<string, Preset>>;
export declare function getPreset({ repo, presetName, }: PresetConfig): Preset | undefined;
