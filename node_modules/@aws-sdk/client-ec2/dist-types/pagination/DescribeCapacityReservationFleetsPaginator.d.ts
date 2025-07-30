import { Paginator } from "@smithy/types";
import { DescribeCapacityReservationFleetsCommandInput, DescribeCapacityReservationFleetsCommandOutput } from "../commands/DescribeCapacityReservationFleetsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeCapacityReservationFleets: (config: EC2PaginationConfiguration, input: DescribeCapacityReservationFleetsCommandInput, ...rest: any[]) => Paginator<DescribeCapacityReservationFleetsCommandOutput>;
