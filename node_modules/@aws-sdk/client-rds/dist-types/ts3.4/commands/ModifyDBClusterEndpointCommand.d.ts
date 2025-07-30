import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DBClusterEndpoint } from "../models/models_0";
import { ModifyDBClusterEndpointMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBClusterEndpointCommandInput
  extends ModifyDBClusterEndpointMessage {}
export interface ModifyDBClusterEndpointCommandOutput
  extends DBClusterEndpoint,
    __MetadataBearer {}
declare const ModifyDBClusterEndpointCommand_base: {
  new (
    input: ModifyDBClusterEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBClusterEndpointCommandInput,
    ModifyDBClusterEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBClusterEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBClusterEndpointCommandInput,
    ModifyDBClusterEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBClusterEndpointCommand extends ModifyDBClusterEndpointCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBClusterEndpointMessage;
      output: DBClusterEndpoint;
    };
    sdk: {
      input: ModifyDBClusterEndpointCommandInput;
      output: ModifyDBClusterEndpointCommandOutput;
    };
  };
}
