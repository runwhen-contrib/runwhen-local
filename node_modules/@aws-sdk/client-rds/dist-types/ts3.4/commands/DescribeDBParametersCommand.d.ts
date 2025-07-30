import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBParameterGroupDetails,
  DescribeDBParametersMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBParametersCommandInput
  extends DescribeDBParametersMessage {}
export interface DescribeDBParametersCommandOutput
  extends DBParameterGroupDetails,
    __MetadataBearer {}
declare const DescribeDBParametersCommand_base: {
  new (
    input: DescribeDBParametersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBParametersCommandInput,
    DescribeDBParametersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeDBParametersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBParametersCommandInput,
    DescribeDBParametersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBParametersCommand extends DescribeDBParametersCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBParametersMessage;
      output: DBParameterGroupDetails;
    };
    sdk: {
      input: DescribeDBParametersCommandInput;
      output: DescribeDBParametersCommandOutput;
    };
  };
}
