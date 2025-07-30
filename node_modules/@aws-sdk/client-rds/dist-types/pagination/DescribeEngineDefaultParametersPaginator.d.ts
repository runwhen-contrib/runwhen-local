import { Paginator } from "@smithy/types";
import { DescribeEngineDefaultParametersCommandInput, DescribeEngineDefaultParametersCommandOutput } from "../commands/DescribeEngineDefaultParametersCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeEngineDefaultParameters: (config: RDSPaginationConfiguration, input: DescribeEngineDefaultParametersCommandInput, ...rest: any[]) => Paginator<DescribeEngineDefaultParametersCommandOutput>;
