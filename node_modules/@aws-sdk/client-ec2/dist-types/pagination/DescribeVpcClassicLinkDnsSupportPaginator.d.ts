import { Paginator } from "@smithy/types";
import { DescribeVpcClassicLinkDnsSupportCommandInput, DescribeVpcClassicLinkDnsSupportCommandOutput } from "../commands/DescribeVpcClassicLinkDnsSupportCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeVpcClassicLinkDnsSupport: (config: EC2PaginationConfiguration, input: DescribeVpcClassicLinkDnsSupportCommandInput, ...rest: any[]) => Paginator<DescribeVpcClassicLinkDnsSupportCommandOutput>;
