import { Paginator } from "@smithy/types";
import {
  DescribeEventSubscriptionsCommandInput,
  DescribeEventSubscriptionsCommandOutput,
} from "../commands/DescribeEventSubscriptionsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeEventSubscriptions: (
  config: RDSPaginationConfiguration,
  input: DescribeEventSubscriptionsCommandInput,
  ...rest: any[]
) => Paginator<DescribeEventSubscriptionsCommandOutput>;
