import { Paginator } from "@smithy/types";
import { DescribeVolumeStatusCommandInput, DescribeVolumeStatusCommandOutput } from "../commands/DescribeVolumeStatusCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeVolumeStatus: (config: EC2PaginationConfiguration, input: DescribeVolumeStatusCommandInput, ...rest: any[]) => Paginator<DescribeVolumeStatusCommandOutput>;
