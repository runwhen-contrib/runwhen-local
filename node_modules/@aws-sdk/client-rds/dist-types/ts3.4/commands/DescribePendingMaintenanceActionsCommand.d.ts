import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribePendingMaintenanceActionsMessage,
  PendingMaintenanceActionsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribePendingMaintenanceActionsCommandInput
  extends DescribePendingMaintenanceActionsMessage {}
export interface DescribePendingMaintenanceActionsCommandOutput
  extends PendingMaintenanceActionsMessage,
    __MetadataBearer {}
declare const DescribePendingMaintenanceActionsCommand_base: {
  new (
    input: DescribePendingMaintenanceActionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribePendingMaintenanceActionsCommandInput,
    DescribePendingMaintenanceActionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribePendingMaintenanceActionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribePendingMaintenanceActionsCommandInput,
    DescribePendingMaintenanceActionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribePendingMaintenanceActionsCommand extends DescribePendingMaintenanceActionsCommand_base {
  protected static __types: {
    api: {
      input: DescribePendingMaintenanceActionsMessage;
      output: PendingMaintenanceActionsMessage;
    };
    sdk: {
      input: DescribePendingMaintenanceActionsCommandInput;
      output: DescribePendingMaintenanceActionsCommandOutput;
    };
  };
}
