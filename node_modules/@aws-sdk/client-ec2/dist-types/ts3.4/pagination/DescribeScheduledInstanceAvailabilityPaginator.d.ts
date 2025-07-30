import { Paginator } from "@smithy/types";
import {
  DescribeScheduledInstanceAvailabilityCommandInput,
  DescribeScheduledInstanceAvailabilityCommandOutput,
} from "../commands/DescribeScheduledInstanceAvailabilityCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeScheduledInstanceAvailability: (
  config: EC2PaginationConfiguration,
  input: DescribeScheduledInstanceAvailabilityCommandInput,
  ...rest: any[]
) => Paginator<DescribeScheduledInstanceAvailabilityCommandOutput>;
