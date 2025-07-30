import { Paginator } from "@smithy/types";
import { DescribeFastSnapshotRestoresCommandInput, DescribeFastSnapshotRestoresCommandOutput } from "../commands/DescribeFastSnapshotRestoresCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeFastSnapshotRestores: (config: EC2PaginationConfiguration, input: DescribeFastSnapshotRestoresCommandInput, ...rest: any[]) => Paginator<DescribeFastSnapshotRestoresCommandOutput>;
