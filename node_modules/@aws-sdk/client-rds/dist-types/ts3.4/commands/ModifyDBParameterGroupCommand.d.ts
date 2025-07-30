import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBParameterGroupNameMessage,
  ModifyDBParameterGroupMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBParameterGroupCommandInput
  extends ModifyDBParameterGroupMessage {}
export interface ModifyDBParameterGroupCommandOutput
  extends DBParameterGroupNameMessage,
    __MetadataBearer {}
declare const ModifyDBParameterGroupCommand_base: {
  new (
    input: ModifyDBParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBParameterGroupCommandInput,
    ModifyDBParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBParameterGroupCommandInput,
    ModifyDBParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBParameterGroupCommand extends ModifyDBParameterGroupCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBParameterGroupMessage;
      output: DBParameterGroupNameMessage;
    };
    sdk: {
      input: ModifyDBParameterGroupCommandInput;
      output: ModifyDBParameterGroupCommandOutput;
    };
  };
}
