import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBClustersCommandInput } from "../commands/DescribeDBClustersCommand";
import { RDSClient } from "../RDSClient";
export declare const waitForDBClusterAvailable: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBClustersCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilDBClusterAvailable: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBClustersCommandInput
) => Promise<WaiterResult>;
