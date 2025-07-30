import { createPaginator } from "@smithy/core";
import { DownloadDBLogFilePortionCommand, } from "../commands/DownloadDBLogFilePortionCommand";
import { RDSClient } from "../RDSClient";
export const paginateDownloadDBLogFilePortion = createPaginator(RDSClient, DownloadDBLogFilePortionCommand, "Marker", "Marker", "NumberOfLines");
