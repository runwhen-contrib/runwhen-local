import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateGlobalClusterMessage,
  CreateGlobalClusterResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateGlobalClusterCommandInput
  extends CreateGlobalClusterMessage {}
export interface CreateGlobalClusterCommandOutput
  extends CreateGlobalClusterResult,
    __MetadataBearer {}
declare const CreateGlobalClusterCommand_base: {
  new (
    input: CreateGlobalClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateGlobalClusterCommandInput,
    CreateGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateGlobalClusterCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateGlobalClusterCommandInput,
    CreateGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateGlobalClusterCommand extends CreateGlobalClusterCommand_base {
  protected static __types: {
    api: {
      input: CreateGlobalClusterMessage;
      output: CreateGlobalClusterResult;
    };
    sdk: {
      input: CreateGlobalClusterCommandInput;
      output: CreateGlobalClusterCommandOutput;
    };
  };
}
