import { Paginator } from "@smithy/types";
import { DescribeAddressTransfersCommandInput, DescribeAddressTransfersCommandOutput } from "../commands/DescribeAddressTransfersCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeAddressTransfers: (config: EC2PaginationConfiguration, input: DescribeAddressTransfersCommandInput, ...rest: any[]) => Paginator<DescribeAddressTransfersCommandOutput>;
