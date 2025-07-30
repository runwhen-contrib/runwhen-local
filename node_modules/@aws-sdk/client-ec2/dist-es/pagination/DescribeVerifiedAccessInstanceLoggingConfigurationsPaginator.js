import { createPaginator } from "@smithy/core";
import { DescribeVerifiedAccessInstanceLoggingConfigurationsCommand, } from "../commands/DescribeVerifiedAccessInstanceLoggingConfigurationsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVerifiedAccessInstanceLoggingConfigurations = createPaginator(EC2Client, DescribeVerifiedAccessInstanceLoggingConfigurationsCommand, "NextToken", "NextToken", "MaxResults");
