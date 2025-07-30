import { Paginator } from "@smithy/types";
import {
  DescribeEventsCommandInput,
  DescribeEventsCommandOutput,
} from "../commands/DescribeEventsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeEvents: (
  config: RDSPaginationConfiguration,
  input: DescribeEventsCommandInput,
  ...rest: any[]
) => Paginator<DescribeEventsCommandOutput>;
