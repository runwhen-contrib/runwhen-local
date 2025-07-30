import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeVpcPeeringConnectionsCommandInput } from "../commands/DescribeVpcPeeringConnectionsCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForVpcPeeringConnectionDeleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpcPeeringConnectionsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilVpcPeeringConnectionDeleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpcPeeringConnectionsCommandInput
) => Promise<WaiterResult>;
