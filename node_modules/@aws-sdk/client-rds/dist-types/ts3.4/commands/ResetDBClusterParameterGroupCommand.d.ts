import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBClusterParameterGroupNameMessage,
  ResetDBClusterParameterGroupMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ResetDBClusterParameterGroupCommandInput
  extends ResetDBClusterParameterGroupMessage {}
export interface ResetDBClusterParameterGroupCommandOutput
  extends DBClusterParameterGroupNameMessage,
    __MetadataBearer {}
declare const ResetDBClusterParameterGroupCommand_base: {
  new (
    input: ResetDBClusterParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetDBClusterParameterGroupCommandInput,
    ResetDBClusterParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ResetDBClusterParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetDBClusterParameterGroupCommandInput,
    ResetDBClusterParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ResetDBClusterParameterGroupCommand extends ResetDBClusterParameterGroupCommand_base {
  protected static __types: {
    api: {
      input: ResetDBClusterParameterGroupMessage;
      output: DBClusterParameterGroupNameMessage;
    };
    sdk: {
      input: ResetDBClusterParameterGroupCommandInput;
      output: ResetDBClusterParameterGroupCommandOutput;
    };
  };
}
