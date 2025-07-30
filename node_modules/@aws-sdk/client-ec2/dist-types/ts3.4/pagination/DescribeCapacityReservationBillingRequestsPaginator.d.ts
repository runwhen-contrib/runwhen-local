import { Paginator } from "@smithy/types";
import {
  DescribeCapacityReservationBillingRequestsCommandInput,
  DescribeCapacityReservationBillingRequestsCommandOutput,
} from "../commands/DescribeCapacityReservationBillingRequestsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeCapacityReservationBillingRequests: (
  config: EC2PaginationConfiguration,
  input: DescribeCapacityReservationBillingRequestsCommandInput,
  ...rest: any[]
) => Paginator<DescribeCapacityReservationBillingRequestsCommandOutput>;
