import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeDBClustersCommandInput } from "../commands/DescribeDBClustersCommand";
import { RDSClient } from "../RDSClient";
export declare const waitForDBClusterDeleted: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBClustersCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilDBClusterDeleted: (
  params: WaiterConfiguration<RDSClient>,
  input: DescribeDBClustersCommandInput
) => Promise<WaiterResult>;
