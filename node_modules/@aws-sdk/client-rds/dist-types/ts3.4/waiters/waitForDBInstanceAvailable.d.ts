import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBInstancesCommandInput } from "../commands/DescribeDBInstancesCommand";
import { RDSClient } from "../RDSClient";
export declare const waitForDBInstanceAvailable: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBInstancesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilDBInstanceAvailable: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBInstancesCommandInput
) => Promise<WaiterResult>;
