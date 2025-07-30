import { Paginator } from "@smithy/types";
import { GetAwsNetworkPerformanceDataCommandInput, GetAwsNetworkPerformanceDataCommandOutput } from "../commands/GetAwsNetworkPerformanceDataCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateGetAwsNetworkPerformanceData: (config: EC2PaginationConfiguration, input: GetAwsNetworkPerformanceDataCommandInput, ...rest: any[]) => Paginator<GetAwsNetworkPerformanceDataCommandOutput>;
