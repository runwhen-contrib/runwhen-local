import { Paginator } from "@smithy/types";
import { DescribeAddressesAttributeCommandInput, DescribeAddressesAttributeCommandOutput } from "../commands/DescribeAddressesAttributeCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeAddressesAttribute: (config: EC2PaginationConfiguration, input: DescribeAddressesAttributeCommandInput, ...rest: any[]) => Paginator<DescribeAddressesAttributeCommandOutput>;
