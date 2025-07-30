import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RemoveFromGlobalClusterMessage,
  RemoveFromGlobalClusterResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RemoveFromGlobalClusterCommandInput
  extends RemoveFromGlobalClusterMessage {}
export interface RemoveFromGlobalClusterCommandOutput
  extends RemoveFromGlobalClusterResult,
    __MetadataBearer {}
declare const RemoveFromGlobalClusterCommand_base: {
  new (
    input: RemoveFromGlobalClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RemoveFromGlobalClusterCommandInput,
    RemoveFromGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [RemoveFromGlobalClusterCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    RemoveFromGlobalClusterCommandInput,
    RemoveFromGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RemoveFromGlobalClusterCommand extends RemoveFromGlobalClusterCommand_base {
  protected static __types: {
    api: {
      input: RemoveFromGlobalClusterMessage;
      output: RemoveFromGlobalClusterResult;
    };
    sdk: {
      input: RemoveFromGlobalClusterCommandInput;
      output: RemoveFromGlobalClusterCommandOutput;
    };
  };
}
