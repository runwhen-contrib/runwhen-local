import { Paginator } from "@smithy/types";
import {
  DescribeInstanceTypeOfferingsCommandInput,
  DescribeInstanceTypeOfferingsCommandOutput,
} from "../commands/DescribeInstanceTypeOfferingsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeInstanceTypeOfferings: (
  config: EC2PaginationConfiguration,
  input: DescribeInstanceTypeOfferingsCommandInput,
  ...rest: any[]
) => Paginator<DescribeInstanceTypeOfferingsCommandOutput>;
