import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeNatGatewaysCommandInput } from "../commands/DescribeNatGatewaysCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForNatGatewayDeleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeNatGatewaysCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilNatGatewayDeleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeNatGatewaysCommandInput
) => Promise<WaiterResult>;
