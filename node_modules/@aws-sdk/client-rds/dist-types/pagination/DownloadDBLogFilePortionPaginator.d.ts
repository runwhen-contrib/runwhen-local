import { Paginator } from "@smithy/types";
import { DownloadDBLogFilePortionCommandInput, DownloadDBLogFilePortionCommandOutput } from "../commands/DownloadDBLogFilePortionCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDownloadDBLogFilePortion: (config: RDSPaginationConfiguration, input: DownloadDBLogFilePortionCommandInput, ...rest: any[]) => Paginator<DownloadDBLogFilePortionCommandOutput>;
