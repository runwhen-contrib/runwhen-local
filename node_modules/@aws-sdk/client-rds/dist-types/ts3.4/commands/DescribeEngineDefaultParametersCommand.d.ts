import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeEngineDefaultParametersMessage,
  DescribeEngineDefaultParametersResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeEngineDefaultParametersCommandInput
  extends DescribeEngineDefaultParametersMessage {}
export interface DescribeEngineDefaultParametersCommandOutput
  extends DescribeEngineDefaultParametersResult,
    __MetadataBearer {}
declare const DescribeEngineDefaultParametersCommand_base: {
  new (
    input: DescribeEngineDefaultParametersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEngineDefaultParametersCommandInput,
    DescribeEngineDefaultParametersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeEngineDefaultParametersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEngineDefaultParametersCommandInput,
    DescribeEngineDefaultParametersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeEngineDefaultParametersCommand extends DescribeEngineDefaultParametersCommand_base {
  protected static __types: {
    api: {
      input: DescribeEngineDefaultParametersMessage;
      output: DescribeEngineDefaultParametersResult;
    };
    sdk: {
      input: DescribeEngineDefaultParametersCommandInput;
      output: DescribeEngineDefaultParametersCommandOutput;
    };
  };
}
