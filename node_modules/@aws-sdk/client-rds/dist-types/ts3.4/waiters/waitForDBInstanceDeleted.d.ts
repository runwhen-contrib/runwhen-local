import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBInstancesCommandInput } from "../commands/DescribeDBInstancesCommand";
import { RDSClient } from "../RDSClient";
export declare const waitForDBInstanceDeleted: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBInstancesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilDBInstanceDeleted: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBInstancesCommandInput
) => Promise<WaiterResult>;
