import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeSecurityGroupsCommandInput } from "../commands/DescribeSecurityGroupsCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForSecurityGroupExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeSecurityGroupsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilSecurityGroupExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeSecurityGroupsCommandInput
) => Promise<WaiterResult>;
