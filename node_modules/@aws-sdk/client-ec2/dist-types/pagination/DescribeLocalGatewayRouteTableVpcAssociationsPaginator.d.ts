import { Paginator } from "@smithy/types";
import { DescribeLocalGatewayRouteTableVpcAssociationsCommandInput, DescribeLocalGatewayRouteTableVpcAssociationsCommandOutput } from "../commands/DescribeLocalGatewayRouteTableVpcAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeLocalGatewayRouteTableVpcAssociations: (config: EC2PaginationConfiguration, input: DescribeLocalGatewayRouteTableVpcAssociationsCommandInput, ...rest: any[]) => Paginator<DescribeLocalGatewayRouteTableVpcAssociationsCommandOutput>;
