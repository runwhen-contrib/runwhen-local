import { Paginator } from "@smithy/types";
import { DescribeCapacityBlockExtensionOfferingsCommandInput, DescribeCapacityBlockExtensionOfferingsCommandOutput } from "../commands/DescribeCapacityBlockExtensionOfferingsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeCapacityBlockExtensionOfferings: (config: EC2PaginationConfiguration, input: DescribeCapacityBlockExtensionOfferingsCommandInput, ...rest: any[]) => Paginator<DescribeCapacityBlockExtensionOfferingsCommandOutput>;
