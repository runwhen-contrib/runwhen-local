import { Paginator } from "@smithy/types";
import { DescribeVerifiedAccessInstancesCommandInput, DescribeVerifiedAccessInstancesCommandOutput } from "../commands/DescribeVerifiedAccessInstancesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeVerifiedAccessInstances: (config: EC2PaginationConfiguration, input: DescribeVerifiedAccessInstancesCommandInput, ...rest: any[]) => Paginator<DescribeVerifiedAccessInstancesCommandOutput>;
