import { Paginator } from "@smithy/types";
import { DescribeSnapshotTierStatusCommandInput, DescribeSnapshotTierStatusCommandOutput } from "../commands/DescribeSnapshotTierStatusCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeSnapshotTierStatus: (config: EC2PaginationConfiguration, input: DescribeSnapshotTierStatusCommandInput, ...rest: any[]) => Paginator<DescribeSnapshotTierStatusCommandOutput>;
