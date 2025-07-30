import { Paginator } from "@smithy/types";
import {
  DescribeInstanceCreditSpecificationsCommandInput,
  DescribeInstanceCreditSpecificationsCommandOutput,
} from "../commands/DescribeInstanceCreditSpecificationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeInstanceCreditSpecifications: (
  config: EC2PaginationConfiguration,
  input: DescribeInstanceCreditSpecificationsCommandInput,
  ...rest: any[]
) => Paginator<DescribeInstanceCreditSpecificationsCommandOutput>;
