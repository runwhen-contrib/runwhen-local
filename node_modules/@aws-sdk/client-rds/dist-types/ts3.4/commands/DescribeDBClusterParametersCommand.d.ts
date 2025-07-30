import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBClusterParameterGroupDetails,
  DescribeDBClusterParametersMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBClusterParametersCommandInput
  extends DescribeDBClusterParametersMessage {}
export interface DescribeDBClusterParametersCommandOutput
  extends DBClusterParameterGroupDetails,
    __MetadataBearer {}
declare const DescribeDBClusterParametersCommand_base: {
  new (
    input: DescribeDBClusterParametersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterParametersCommandInput,
    DescribeDBClusterParametersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeDBClusterParametersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBClusterParametersCommandInput,
    DescribeDBClusterParametersCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBClusterParametersCommand extends DescribeDBClusterParametersCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBClusterParametersMessage;
      output: DBClusterParameterGroupDetails;
    };
    sdk: {
      input: DescribeDBClusterParametersCommandInput;
      output: DescribeDBClusterParametersCommandOutput;
    };
  };
}
