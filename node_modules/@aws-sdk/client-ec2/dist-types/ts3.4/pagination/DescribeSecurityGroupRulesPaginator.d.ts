import { Paginator } from "@smithy/types";
import {
  DescribeSecurityGroupRulesCommandInput,
  DescribeSecurityGroupRulesCommandOutput,
} from "../commands/DescribeSecurityGroupRulesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeSecurityGroupRules: (
  config: EC2PaginationConfiguration,
  input: DescribeSecurityGroupRulesCommandInput,
  ...rest: any[]
) => Paginator<DescribeSecurityGroupRulesCommandOutput>;
