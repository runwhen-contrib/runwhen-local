import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { CreateIntegrationMessage, Integration } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateIntegrationCommandInput
  extends CreateIntegrationMessage {}
export interface CreateIntegrationCommandOutput
  extends Integration,
    __MetadataBearer {}
declare const CreateIntegrationCommand_base: {
  new (
    input: CreateIntegrationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIntegrationCommandInput,
    CreateIntegrationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateIntegrationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIntegrationCommandInput,
    CreateIntegrationCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateIntegrationCommand extends CreateIntegrationCommand_base {
  protected static __types: {
    api: {
      input: CreateIntegrationMessage;
      output: Integration;
    };
    sdk: {
      input: CreateIntegrationCommandInput;
      output: CreateIntegrationCommandOutput;
    };
  };
}
