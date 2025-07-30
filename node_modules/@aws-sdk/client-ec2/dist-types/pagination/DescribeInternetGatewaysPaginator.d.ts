import { Paginator } from "@smithy/types";
import { DescribeInternetGatewaysCommandInput, DescribeInternetGatewaysCommandOutput } from "../commands/DescribeInternetGatewaysCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeInternetGateways: (config: EC2PaginationConfiguration, input: DescribeInternetGatewaysCommandInput, ...rest: any[]) => Paginator<DescribeInternetGatewaysCommandOutput>;
