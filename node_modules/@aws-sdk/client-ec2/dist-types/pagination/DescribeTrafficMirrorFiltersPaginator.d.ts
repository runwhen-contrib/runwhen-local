import { Paginator } from "@smithy/types";
import { DescribeTrafficMirrorFiltersCommandInput, DescribeTrafficMirrorFiltersCommandOutput } from "../commands/DescribeTrafficMirrorFiltersCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeTrafficMirrorFilters: (config: EC2PaginationConfiguration, input: DescribeTrafficMirrorFiltersCommandInput, ...rest: any[]) => Paginator<DescribeTrafficMirrorFiltersCommandOutput>;
