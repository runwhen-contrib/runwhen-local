import { Paginator } from "@smithy/types";
import {
  DescribeEngineDefaultParametersCommandInput,
  DescribeEngineDefaultParametersCommandOutput,
} from "../commands/DescribeEngineDefaultParametersCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeEngineDefaultParameters: (
  config: RDSPaginationConfiguration,
  input: DescribeEngineDefaultParametersCommandInput,
  ...rest: any[]
) => Paginator<DescribeEngineDefaultParametersCommandOutput>;
