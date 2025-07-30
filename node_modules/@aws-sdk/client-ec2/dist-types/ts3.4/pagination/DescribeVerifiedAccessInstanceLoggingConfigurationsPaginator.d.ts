import { Paginator } from "@smithy/types";
import {
  DescribeVerifiedAccessInstanceLoggingConfigurationsCommandInput,
  DescribeVerifiedAccessInstanceLoggingConfigurationsCommandOutput,
} from "../commands/DescribeVerifiedAccessInstanceLoggingConfigurationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeVerifiedAccessInstanceLoggingConfigurations: (
  config: EC2PaginationConfiguration,
  input: DescribeVerifiedAccessInstanceLoggingConfigurationsCommandInput,
  ...rest: any[]
) => Paginator<DescribeVerifiedAccessInstanceLoggingConfigurationsCommandOutput>;
