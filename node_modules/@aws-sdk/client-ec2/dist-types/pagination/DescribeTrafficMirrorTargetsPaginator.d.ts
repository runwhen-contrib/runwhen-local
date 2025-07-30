import { Paginator } from "@smithy/types";
import { DescribeTrafficMirrorTargetsCommandInput, DescribeTrafficMirrorTargetsCommandOutput } from "../commands/DescribeTrafficMirrorTargetsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeTrafficMirrorTargets: (config: EC2PaginationConfiguration, input: DescribeTrafficMirrorTargetsCommandInput, ...rest: any[]) => Paginator<DescribeTrafficMirrorTargetsCommandOutput>;
