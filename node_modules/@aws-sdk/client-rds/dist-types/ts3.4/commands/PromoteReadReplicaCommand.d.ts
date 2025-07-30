import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  PromoteReadReplicaMessage,
  PromoteReadReplicaResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface PromoteReadReplicaCommandInput
  extends PromoteReadReplicaMessage {}
export interface PromoteReadReplicaCommandOutput
  extends PromoteReadReplicaResult,
    __MetadataBearer {}
declare const PromoteReadReplicaCommand_base: {
  new (
    input: PromoteReadReplicaCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PromoteReadReplicaCommandInput,
    PromoteReadReplicaCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: PromoteReadReplicaCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PromoteReadReplicaCommandInput,
    PromoteReadReplicaCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class PromoteReadReplicaCommand extends PromoteReadReplicaCommand_base {
  protected static __types: {
    api: {
      input: PromoteReadReplicaMessage;
      output: PromoteReadReplicaResult;
    };
    sdk: {
      input: PromoteReadReplicaCommandInput;
      output: PromoteReadReplicaCommandOutput;
    };
  };
}
