import { Paginator } from "@smithy/types";
import { DescribeEgressOnlyInternetGatewaysCommandInput, DescribeEgressOnlyInternetGatewaysCommandOutput } from "../commands/DescribeEgressOnlyInternetGatewaysCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeEgressOnlyInternetGateways: (config: EC2PaginationConfiguration, input: DescribeEgressOnlyInternetGatewaysCommandInput, ...rest: any[]) => Paginator<DescribeEgressOnlyInternetGatewaysCommandOutput>;
