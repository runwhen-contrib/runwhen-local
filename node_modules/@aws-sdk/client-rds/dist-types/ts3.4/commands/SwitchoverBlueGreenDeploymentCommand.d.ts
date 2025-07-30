import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  SwitchoverBlueGreenDeploymentRequest,
  SwitchoverBlueGreenDeploymentResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface SwitchoverBlueGreenDeploymentCommandInput
  extends SwitchoverBlueGreenDeploymentRequest {}
export interface SwitchoverBlueGreenDeploymentCommandOutput
  extends SwitchoverBlueGreenDeploymentResponse,
    __MetadataBearer {}
declare const SwitchoverBlueGreenDeploymentCommand_base: {
  new (
    input: SwitchoverBlueGreenDeploymentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    SwitchoverBlueGreenDeploymentCommandInput,
    SwitchoverBlueGreenDeploymentCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: SwitchoverBlueGreenDeploymentCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    SwitchoverBlueGreenDeploymentCommandInput,
    SwitchoverBlueGreenDeploymentCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class SwitchoverBlueGreenDeploymentCommand extends SwitchoverBlueGreenDeploymentCommand_base {
  protected static __types: {
    api: {
      input: SwitchoverBlueGreenDeploymentRequest;
      output: SwitchoverBlueGreenDeploymentResponse;
    };
    sdk: {
      input: SwitchoverBlueGreenDeploymentCommandInput;
      output: SwitchoverBlueGreenDeploymentCommandOutput;
    };
  };
}
