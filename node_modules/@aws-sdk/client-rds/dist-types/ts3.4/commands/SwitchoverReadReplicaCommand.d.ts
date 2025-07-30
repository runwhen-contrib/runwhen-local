import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  SwitchoverReadReplicaMessage,
  SwitchoverReadReplicaResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface SwitchoverReadReplicaCommandInput
  extends SwitchoverReadReplicaMessage {}
export interface SwitchoverReadReplicaCommandOutput
  extends SwitchoverReadReplicaResult,
    __MetadataBearer {}
declare const SwitchoverReadReplicaCommand_base: {
  new (
    input: SwitchoverReadReplicaCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    SwitchoverReadReplicaCommandInput,
    SwitchoverReadReplicaCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: SwitchoverReadReplicaCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    SwitchoverReadReplicaCommandInput,
    SwitchoverReadReplicaCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class SwitchoverReadReplicaCommand extends SwitchoverReadReplicaCommand_base {
  protected static __types: {
    api: {
      input: SwitchoverReadReplicaMessage;
      output: SwitchoverReadReplicaResult;
    };
    sdk: {
      input: SwitchoverReadReplicaCommandInput;
      output: SwitchoverReadReplicaCommandOutput;
    };
  };
}
