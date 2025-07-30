import { createPaginator } from "@smithy/core";
import { DescribeVerifiedAccessTrustProvidersCommand, } from "../commands/DescribeVerifiedAccessTrustProvidersCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeVerifiedAccessTrustProviders = createPaginator(EC2Client, DescribeVerifiedAccessTrustProvidersCommand, "NextToken", "NextToken", "MaxResults");
