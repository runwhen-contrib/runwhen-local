import type { Preset, PresetConfig } from '../types';
export declare function getPreset({ repo: pkg, presetName, }: PresetConfig): Promise<Preset | undefined>;
