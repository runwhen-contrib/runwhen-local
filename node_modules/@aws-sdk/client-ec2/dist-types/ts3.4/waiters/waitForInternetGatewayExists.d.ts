import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeInternetGatewaysCommandInput } from "../commands/DescribeInternetGatewaysCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForInternetGatewayExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInternetGatewaysCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilInternetGatewayExists: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeInternetGatewaysCommandInput
) => Promise<WaiterResult>;
