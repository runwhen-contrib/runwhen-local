import { Paginator } from "@smithy/types";
import {
  DescribeHostReservationsCommandInput,
  DescribeHostReservationsCommandOutput,
} from "../commands/DescribeHostReservationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeHostReservations: (
  config: EC2PaginationConfiguration,
  input: DescribeHostReservationsCommandInput,
  ...rest: any[]
) => Paginator<DescribeHostReservationsCommandOutput>;
