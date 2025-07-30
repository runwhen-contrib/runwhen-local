import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeEngineDefaultClusterParametersMessage,
  DescribeEngineDefaultClusterParametersResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeEngineDefaultClusterParametersCommandInput
  extends DescribeEngineDefaultClusterParametersMessage {}
export interface DescribeEngineDefaultClusterParametersCommandOutput
  extends DescribeEngineDefaultClusterParametersResult,
    __MetadataBearer {}
declare const DescribeEngineDefaultClusterParametersCommand_base: {
  new (
    input: DescribeEngineDefaultClusterParametersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEngineDefaultClusterParametersCommandInput,
    DescribeEngineDefaultClusterParametersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeEngineDefaultClusterParametersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEngineDefaultClusterParametersCommandInput,
    DescribeEngineDefaultClusterParametersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeEngineDefaultClusterParametersCommand extends DescribeEngineDefaultClusterParametersCommand_base {
  protected static __types: {
    api: {
      input: DescribeEngineDefaultClusterParametersMessage;
      output: DescribeEngineDefaultClusterParametersResult;
    };
    sdk: {
      input: DescribeEngineDefaultClusterParametersCommandInput;
      output: DescribeEngineDefaultClusterParametersCommandOutput;
    };
  };
}
