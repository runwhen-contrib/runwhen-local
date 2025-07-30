import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBParameterGroupNameMessage,
  ResetDBParameterGroupMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ResetDBParameterGroupCommandInput
  extends ResetDBParameterGroupMessage {}
export interface ResetDBParameterGroupCommandOutput
  extends DBParameterGroupNameMessage,
    __MetadataBearer {}
declare const ResetDBParameterGroupCommand_base: {
  new (
    input: ResetDBParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetDBParameterGroupCommandInput,
    ResetDBParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ResetDBParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetDBParameterGroupCommandInput,
    ResetDBParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ResetDBParameterGroupCommand extends ResetDBParameterGroupCommand_base {
  protected static __types: {
    api: {
      input: ResetDBParameterGroupMessage;
      output: DBParameterGroupNameMessage;
    };
    sdk: {
      input: ResetDBParameterGroupCommandInput;
      output: ResetDBParameterGroupCommandOutput;
    };
  };
}
