import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyDBClusterMessage,
  ModifyDBClusterResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBClusterCommandInput extends ModifyDBClusterMessage {}
export interface ModifyDBClusterCommandOutput
  extends ModifyDBClusterResult,
    __MetadataBearer {}
declare const ModifyDBClusterCommand_base: {
  new (
    input: ModifyDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBClusterCommandInput,
    ModifyDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBClusterCommandInput,
    ModifyDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBClusterCommand extends ModifyDBClusterCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBClusterMessage;
      output: ModifyDBClusterResult;
    };
    sdk: {
      input: ModifyDBClusterCommandInput;
      output: ModifyDBClusterCommandOutput;
    };
  };
}
