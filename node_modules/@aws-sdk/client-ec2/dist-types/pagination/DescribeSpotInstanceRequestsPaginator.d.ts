import { Paginator } from "@smithy/types";
import { DescribeSpotInstanceRequestsCommandInput, DescribeSpotInstanceRequestsCommandOutput } from "../commands/DescribeSpotInstanceRequestsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeSpotInstanceRequests: (config: EC2PaginationConfiguration, input: DescribeSpotInstanceRequestsCommandInput, ...rest: any[]) => Paginator<DescribeSpotInstanceRequestsCommandOutput>;
