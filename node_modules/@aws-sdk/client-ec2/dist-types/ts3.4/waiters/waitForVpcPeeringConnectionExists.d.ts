import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeVpcPeeringConnectionsCommandInput } from "../commands/DescribeVpcPeeringConnectionsCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForVpcPeeringConnectionExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpcPeeringConnectionsCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilVpcPeeringConnectionExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVpcPeeringConnectionsCommandInput
) => Promise<WaiterResult>;
