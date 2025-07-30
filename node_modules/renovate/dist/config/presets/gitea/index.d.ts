import type { Preset, PresetConfig } from '../types';
export declare const Endpoint = "https://gitea.com/";
export declare function fetchJSONFile(repo: string, fileName: string, endpoint: string, tag?: string | null): Promise<Preset>;
export declare function getPresetFromEndpoint(repo: string, filePreset: string, presetPath?: string, endpoint?: string, tag?: string): Promise<Preset | undefined>;
export declare function getPreset({ repo, presetName, presetPath, tag, }: PresetConfig): Promise<Preset | undefined>;
