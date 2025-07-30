import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  SwitchoverGlobalClusterMessage,
  SwitchoverGlobalClusterResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface SwitchoverGlobalClusterCommandInput
  extends SwitchoverGlobalClusterMessage {}
export interface SwitchoverGlobalClusterCommandOutput
  extends SwitchoverGlobalClusterResult,
    __MetadataBearer {}
declare const SwitchoverGlobalClusterCommand_base: {
  new (
    input: SwitchoverGlobalClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    SwitchoverGlobalClusterCommandInput,
    SwitchoverGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: SwitchoverGlobalClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    SwitchoverGlobalClusterCommandInput,
    SwitchoverGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class SwitchoverGlobalClusterCommand extends SwitchoverGlobalClusterCommand_base {
  protected static __types: {
    api: {
      input: SwitchoverGlobalClusterMessage;
      output: SwitchoverGlobalClusterResult;
    };
    sdk: {
      input: SwitchoverGlobalClusterCommandInput;
      output: SwitchoverGlobalClusterCommandOutput;
    };
  };
}
