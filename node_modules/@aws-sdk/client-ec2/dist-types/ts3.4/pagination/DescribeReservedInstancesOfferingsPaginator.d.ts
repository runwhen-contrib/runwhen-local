import { Paginator } from "@smithy/types";
import {
  DescribeReservedInstancesOfferingsCommandInput,
  DescribeReservedInstancesOfferingsCommandOutput,
} from "../commands/DescribeReservedInstancesOfferingsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeReservedInstancesOfferings: (
  config: EC2PaginationConfiguration,
  input: DescribeReservedInstancesOfferingsCommandInput,
  ...rest: any[]
) => Paginator<DescribeReservedInstancesOfferingsCommandOutput>;
