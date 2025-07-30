import { Paginator } from "@smithy/types";
import { DescribeTransitGatewayPolicyTablesCommandInput, DescribeTransitGatewayPolicyTablesCommandOutput } from "../commands/DescribeTransitGatewayPolicyTablesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeTransitGatewayPolicyTables: (config: EC2PaginationConfiguration, input: DescribeTransitGatewayPolicyTablesCommandInput, ...rest: any[]) => Paginator<DescribeTransitGatewayPolicyTablesCommandOutput>;
