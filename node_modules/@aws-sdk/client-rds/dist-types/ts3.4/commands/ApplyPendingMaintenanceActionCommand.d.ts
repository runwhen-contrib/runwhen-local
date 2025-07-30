import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ApplyPendingMaintenanceActionMessage,
  ApplyPendingMaintenanceActionResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ApplyPendingMaintenanceActionCommandInput
  extends ApplyPendingMaintenanceActionMessage {}
export interface ApplyPendingMaintenanceActionCommandOutput
  extends ApplyPendingMaintenanceActionResult,
    __MetadataBearer {}
declare const ApplyPendingMaintenanceActionCommand_base: {
  new (
    input: ApplyPendingMaintenanceActionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ApplyPendingMaintenanceActionCommandInput,
    ApplyPendingMaintenanceActionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ApplyPendingMaintenanceActionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ApplyPendingMaintenanceActionCommandInput,
    ApplyPendingMaintenanceActionCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ApplyPendingMaintenanceActionCommand extends ApplyPendingMaintenanceActionCommand_base {
  protected static __types: {
    api: {
      input: ApplyPendingMaintenanceActionMessage;
      output: ApplyPendingMaintenanceActionResult;
    };
    sdk: {
      input: ApplyPendingMaintenanceActionCommandInput;
      output: ApplyPendingMaintenanceActionCommandOutput;
    };
  };
}
