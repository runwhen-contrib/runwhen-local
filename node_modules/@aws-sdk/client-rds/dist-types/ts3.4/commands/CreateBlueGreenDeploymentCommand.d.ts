import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateBlueGreenDeploymentRequest,
  CreateBlueGreenDeploymentResponse,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateBlueGreenDeploymentCommandInput
  extends CreateBlueGreenDeploymentRequest {}
export interface CreateBlueGreenDeploymentCommandOutput
  extends CreateBlueGreenDeploymentResponse,
    __MetadataBearer {}
declare const CreateBlueGreenDeploymentCommand_base: {
  new (
    input: CreateBlueGreenDeploymentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateBlueGreenDeploymentCommandInput,
    CreateBlueGreenDeploymentCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateBlueGreenDeploymentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateBlueGreenDeploymentCommandInput,
    CreateBlueGreenDeploymentCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateBlueGreenDeploymentCommand extends CreateBlueGreenDeploymentCommand_base {
  protected static __types: {
    api: {
      input: CreateBlueGreenDeploymentRequest;
      output: CreateBlueGreenDeploymentResponse;
    };
    sdk: {
      input: CreateBlueGreenDeploymentCommandInput;
      output: CreateBlueGreenDeploymentCommandOutput;
    };
  };
}
