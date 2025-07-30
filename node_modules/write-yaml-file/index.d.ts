declare module "write-yaml-file" {

	interface WriteYamlFile {
		(filepath: string, data: any, opts?: any): Promise<void>;
		sync(filepath: string, data: any, opts?: any): void;
	}

	const writeYamlFile: WriteYamlFile;

	export = writeYamlFile;
}
