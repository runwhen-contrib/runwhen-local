import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteBlueGreenDeploymentRequest,
  DeleteBlueGreenDeploymentResponse,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteBlueGreenDeploymentCommandInput
  extends DeleteBlueGreenDeploymentRequest {}
export interface DeleteBlueGreenDeploymentCommandOutput
  extends DeleteBlueGreenDeploymentResponse,
    __MetadataBearer {}
declare const DeleteBlueGreenDeploymentCommand_base: {
  new (
    input: DeleteBlueGreenDeploymentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteBlueGreenDeploymentCommandInput,
    DeleteBlueGreenDeploymentCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteBlueGreenDeploymentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteBlueGreenDeploymentCommandInput,
    DeleteBlueGreenDeploymentCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteBlueGreenDeploymentCommand extends DeleteBlueGreenDeploymentCommand_base {
  protected static __types: {
    api: {
      input: DeleteBlueGreenDeploymentRequest;
      output: DeleteBlueGreenDeploymentResponse;
    };
    sdk: {
      input: DeleteBlueGreenDeploymentCommandInput;
      output: DeleteBlueGreenDeploymentCommandOutput;
    };
  };
}
