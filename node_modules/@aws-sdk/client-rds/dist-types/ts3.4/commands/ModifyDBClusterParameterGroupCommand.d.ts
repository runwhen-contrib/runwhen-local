import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBClusterParameterGroupNameMessage,
  ModifyDBClusterParameterGroupMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBClusterParameterGroupCommandInput
  extends ModifyDBClusterParameterGroupMessage {}
export interface ModifyDBClusterParameterGroupCommandOutput
  extends DBClusterParameterGroupNameMessage,
    __MetadataBearer {}
declare const ModifyDBClusterParameterGroupCommand_base: {
  new (
    input: ModifyDBClusterParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBClusterParameterGroupCommandInput,
    ModifyDBClusterParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBClusterParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBClusterParameterGroupCommandInput,
    ModifyDBClusterParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBClusterParameterGroupCommand extends ModifyDBClusterParameterGroupCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBClusterParameterGroupMessage;
      output: DBClusterParameterGroupNameMessage;
    };
    sdk: {
      input: ModifyDBClusterParameterGroupCommandInput;
      output: ModifyDBClusterParameterGroupCommandOutput;
    };
  };
}
