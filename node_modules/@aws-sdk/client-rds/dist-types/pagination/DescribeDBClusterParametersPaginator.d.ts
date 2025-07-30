import { Paginator } from "@smithy/types";
import { DescribeDBClusterParametersCommandInput, DescribeDBClusterParametersCommandOutput } from "../commands/DescribeDBClusterParametersCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeDBClusterParameters: (config: RDSPaginationConfiguration, input: DescribeDBClusterParametersCommandInput, ...rest: any[]) => Paginator<DescribeDBClusterParametersCommandOutput>;
