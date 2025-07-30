import type { Preset, PresetConfig } from '../types';
export declare function getPreset({ repo, presetName, presetPath, tag, }: PresetConfig): Promise<Preset | undefined>;
