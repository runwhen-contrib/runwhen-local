import { createPaginator } from "@smithy/core";
import { DescribeTrafficMirrorTargetsCommand, } from "../commands/DescribeTrafficMirrorTargetsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTrafficMirrorTargets = createPaginator(EC2Client, DescribeTrafficMirrorTargetsCommand, "NextToken", "NextToken", "MaxResults");
