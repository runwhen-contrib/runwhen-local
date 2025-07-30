import { Paginator } from "@smithy/types";
import { DescribeInstanceImageMetadataCommandInput, DescribeInstanceImageMetadataCommandOutput } from "../commands/DescribeInstanceImageMetadataCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeInstanceImageMetadata: (config: EC2PaginationConfiguration, input: DescribeInstanceImageMetadataCommandInput, ...rest: any[]) => Paginator<DescribeInstanceImageMetadataCommandOutput>;
