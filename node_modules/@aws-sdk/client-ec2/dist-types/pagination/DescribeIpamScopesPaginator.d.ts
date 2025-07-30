import { Paginator } from "@smithy/types";
import { DescribeIpamScopesCommandInput, DescribeIpamScopesCommandOutput } from "../commands/DescribeIpamScopesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeIpamScopes: (config: EC2PaginationConfiguration, input: DescribeIpamScopesCommandInput, ...rest: any[]) => Paginator<DescribeIpamScopesCommandOutput>;
