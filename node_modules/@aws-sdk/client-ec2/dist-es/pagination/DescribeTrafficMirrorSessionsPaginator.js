import { createPaginator } from "@smithy/core";
import { DescribeTrafficMirrorSessionsCommand, } from "../commands/DescribeTrafficMirrorSessionsCommand";
import { EC2Client } from "../EC2Client";
export const paginateDescribeTrafficMirrorSessions = createPaginator(EC2Client, DescribeTrafficMirrorSessionsCommand, "NextToken", "NextToken", "MaxResults");
