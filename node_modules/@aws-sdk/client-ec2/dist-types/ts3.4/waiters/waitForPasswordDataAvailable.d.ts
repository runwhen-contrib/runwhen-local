import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { GetPasswordDataCommandInput } from "../commands/GetPasswordDataCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForPasswordDataAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: GetPasswordDataCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilPasswordDataAvailable: (
  params: WaiterConfiguration<EC2Client>,
  input: GetPasswordDataCommandInput
) => Promise<WaiterResult>;
