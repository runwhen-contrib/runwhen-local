import { Paginator } from "@smithy/types";
import {
  DescribeScheduledInstancesCommandInput,
  DescribeScheduledInstancesCommandOutput,
} from "../commands/DescribeScheduledInstancesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeScheduledInstances: (
  config: EC2PaginationConfiguration,
  input: DescribeScheduledInstancesCommandInput,
  ...rest: any[]
) => Paginator<DescribeScheduledInstancesCommandOutput>;
