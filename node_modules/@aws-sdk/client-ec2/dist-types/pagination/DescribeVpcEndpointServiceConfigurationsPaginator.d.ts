import { Paginator } from "@smithy/types";
import { DescribeVpcEndpointServiceConfigurationsCommandInput, DescribeVpcEndpointServiceConfigurationsCommandOutput } from "../commands/DescribeVpcEndpointServiceConfigurationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeVpcEndpointServiceConfigurations: (config: EC2PaginationConfiguration, input: DescribeVpcEndpointServiceConfigurationsCommandInput, ...rest: any[]) => Paginator<DescribeVpcEndpointServiceConfigurationsCommandOutput>;
