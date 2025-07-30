import { Paginator } from "@smithy/types";
import { DescribeAwsNetworkPerformanceMetricSubscriptionsCommandInput, DescribeAwsNetworkPerformanceMetricSubscriptionsCommandOutput } from "../commands/DescribeAwsNetworkPerformanceMetricSubscriptionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeAwsNetworkPerformanceMetricSubscriptions: (config: EC2PaginationConfiguration, input: DescribeAwsNetworkPerformanceMetricSubscriptionsCommandInput, ...rest: any[]) => Paginator<DescribeAwsNetworkPerformanceMetricSubscriptionsCommandOutput>;
