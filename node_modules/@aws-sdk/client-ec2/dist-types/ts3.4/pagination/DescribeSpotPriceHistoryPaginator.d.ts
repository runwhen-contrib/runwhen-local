import { Paginator } from "@smithy/types";
import {
  DescribeSpotPriceHistoryCommandInput,
  DescribeSpotPriceHistoryCommandOutput,
} from "../commands/DescribeSpotPriceHistoryCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeSpotPriceHistory: (
  config: EC2PaginationConfiguration,
  input: DescribeSpotPriceHistoryCommandInput,
  ...rest: any[]
) => Paginator<DescribeSpotPriceHistoryCommandOutput>;
