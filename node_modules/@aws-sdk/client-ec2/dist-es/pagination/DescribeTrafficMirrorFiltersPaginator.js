import { createPaginator } from "@smithy/core";
import { DescribeTrafficMirrorFiltersCommand, } from "../commands/DescribeTrafficMirrorFiltersCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTrafficMirrorFilters = createPaginator(EC2Client, DescribeTrafficMirrorFiltersCommand, "NextToken", "NextToken", "MaxResults");
