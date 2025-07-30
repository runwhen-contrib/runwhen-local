import { Paginator } from "@smithy/types";
import { DescribeSecurityGroupVpcAssociationsCommandInput, DescribeSecurityGroupVpcAssociationsCommandOutput } from "../commands/DescribeSecurityGroupVpcAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeSecurityGroupVpcAssociations: (config: EC2PaginationConfiguration, input: DescribeSecurityGroupVpcAssociationsCommandInput, ...rest: any[]) => Paginator<DescribeSecurityGroupVpcAssociationsCommandOutput>;
