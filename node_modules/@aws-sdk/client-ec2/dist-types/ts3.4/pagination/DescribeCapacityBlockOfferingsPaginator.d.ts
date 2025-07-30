import { Paginator } from "@smithy/types";
import {
  DescribeCapacityBlockOfferingsCommandInput,
  DescribeCapacityBlockOfferingsCommandOutput,
} from "../commands/DescribeCapacityBlockOfferingsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeCapacityBlockOfferings: (
  config: EC2PaginationConfiguration,
  input: DescribeCapacityBlockOfferingsCommandInput,
  ...rest: any[]
) => Paginator<DescribeCapacityBlockOfferingsCommandOutput>;
