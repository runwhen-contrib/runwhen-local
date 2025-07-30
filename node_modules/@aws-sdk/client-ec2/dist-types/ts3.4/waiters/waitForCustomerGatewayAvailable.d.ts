import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeCustomerGatewaysCommandInput } from "../commands/DescribeCustomerGatewaysCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForCustomerGatewayAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeCustomerGatewaysCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilCustomerGatewayAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeCustomerGatewaysCommandInput
) => Promise<WaiterResult>;
