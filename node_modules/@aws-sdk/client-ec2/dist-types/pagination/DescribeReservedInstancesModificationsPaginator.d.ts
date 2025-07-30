import { Paginator } from "@smithy/types";
import { DescribeReservedInstancesModificationsCommandInput, DescribeReservedInstancesModificationsCommandOutput } from "../commands/DescribeReservedInstancesModificationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeReservedInstancesModifications: (config: EC2PaginationConfiguration, input: DescribeReservedInstancesModificationsCommandInput, ...rest: any[]) => Paginator<DescribeReservedInstancesModificationsCommandOutput>;
