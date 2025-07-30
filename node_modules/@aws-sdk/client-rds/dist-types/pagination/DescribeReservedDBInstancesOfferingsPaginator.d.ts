import { Paginator } from "@smithy/types";
import { DescribeReservedDBInstancesOfferingsCommandInput, DescribeReservedDBInstancesOfferingsCommandOutput } from "../commands/DescribeReservedDBInstancesOfferingsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeReservedDBInstancesOfferings: (config: RDSPaginationConfiguration, input: DescribeReservedDBInstancesOfferingsCommandInput, ...rest: any[]) => Paginator<DescribeReservedDBInstancesOfferingsCommandOutput>;
