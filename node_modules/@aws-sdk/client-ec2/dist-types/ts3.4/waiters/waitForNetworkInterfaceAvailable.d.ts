import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeNetworkInterfacesCommandInput } from "../commands/DescribeNetworkInterfacesCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForNetworkInterfaceAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeNetworkInterfacesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilNetworkInterfaceAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeNetworkInterfacesCommandInput
) => Promise<WaiterResult>;
