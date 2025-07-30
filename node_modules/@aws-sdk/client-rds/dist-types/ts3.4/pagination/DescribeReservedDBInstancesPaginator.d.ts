import { Paginator } from "@smithy/types";
import {
  DescribeReservedDBInstancesCommandInput,
  DescribeReservedDBInstancesCommandOutput,
} from "../commands/DescribeReservedDBInstancesCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeReservedDBInstances: (
  config: RDSPaginationConfiguration,
  input: DescribeReservedDBInstancesCommandInput,
  ...rest: any[]
) => Paginator<DescribeReservedDBInstancesCommandOutput>;
