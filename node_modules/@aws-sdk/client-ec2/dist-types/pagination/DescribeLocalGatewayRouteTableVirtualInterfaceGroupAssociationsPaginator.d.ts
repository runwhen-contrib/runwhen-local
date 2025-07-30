import { Paginator } from "@smithy/types";
import { DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandInput, DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandOutput } from "../commands/DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociations: (config: EC2PaginationConfiguration, input: DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandInput, ...rest: any[]) => Paginator<DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsCommandOutput>;
