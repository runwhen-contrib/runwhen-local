import { Paginator } from "@smithy/types";
import {
  GetGroupsForCapacityReservationCommandInput,
  GetGroupsForCapacityReservationCommandOutput,
} from "../commands/GetGroupsForCapacityReservationCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetGroupsForCapacityReservation: (
  config: EC2PaginationConfiguration,
  input: GetGroupsForCapacityReservationCommandInput,
  ...rest: any[]
) => Paginator<GetGroupsForCapacityReservationCommandOutput>;
