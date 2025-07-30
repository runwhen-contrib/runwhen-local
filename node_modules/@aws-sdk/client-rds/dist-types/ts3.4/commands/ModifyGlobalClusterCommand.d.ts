import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyGlobalClusterMessage,
  ModifyGlobalClusterResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyGlobalClusterCommandInput
  extends ModifyGlobalClusterMessage {}
export interface ModifyGlobalClusterCommandOutput
  extends ModifyGlobalClusterResult,
    __MetadataBearer {}
declare const ModifyGlobalClusterCommand_base: {
  new (
    input: ModifyGlobalClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyGlobalClusterCommandInput,
    ModifyGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ModifyGlobalClusterCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyGlobalClusterCommandInput,
    ModifyGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyGlobalClusterCommand extends ModifyGlobalClusterCommand_base {
  protected static __types: {
    api: {
      input: ModifyGlobalClusterMessage;
      output: ModifyGlobalClusterResult;
    };
    sdk: {
      input: ModifyGlobalClusterCommandInput;
      output: ModifyGlobalClusterCommandOutput;
    };
  };
}
