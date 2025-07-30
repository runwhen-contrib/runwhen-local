import { Paginator } from "@smithy/types";
import {
  DescribeInstancesCommandInput,
  DescribeInstancesCommandOutput,
} from "../commands/DescribeInstancesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeInstances: (
  config: EC2PaginationConfiguration,
  input: DescribeInstancesCommandInput,
  ...rest: any[]
) => Paginator<DescribeInstancesCommandOutput>;
