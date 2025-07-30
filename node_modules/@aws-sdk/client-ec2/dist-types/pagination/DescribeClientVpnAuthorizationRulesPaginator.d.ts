import { Paginator } from "@smithy/types";
import { DescribeClientVpnAuthorizationRulesCommandInput, DescribeClientVpnAuthorizationRulesCommandOutput } from "../commands/DescribeClientVpnAuthorizationRulesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeClientVpnAuthorizationRules: (config: EC2PaginationConfiguration, input: DescribeClientVpnAuthorizationRulesCommandInput, ...rest: any[]) => Paginator<DescribeClientVpnAuthorizationRulesCommandOutput>;
