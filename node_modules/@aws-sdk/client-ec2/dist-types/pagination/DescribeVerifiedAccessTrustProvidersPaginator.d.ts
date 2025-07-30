import { Paginator } from "@smithy/types";
import { DescribeVerifiedAccessTrustProvidersCommandInput, DescribeVerifiedAccessTrustProvidersCommandOutput } from "../commands/DescribeVerifiedAccessTrustProvidersCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeVerifiedAccessTrustProviders: (config: EC2PaginationConfiguration, input: DescribeVerifiedAccessTrustProvidersCommandInput, ...rest: any[]) => Paginator<DescribeVerifiedAccessTrustProvidersCommandOutput>;
