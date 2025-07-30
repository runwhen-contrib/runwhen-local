import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  PurchaseCapacityBlockExtensionRequest,
  PurchaseCapacityBlockExtensionResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface PurchaseCapacityBlockExtensionCommandInput
  extends PurchaseCapacityBlockExtensionRequest {}
export interface PurchaseCapacityBlockExtensionCommandOutput
  extends PurchaseCapacityBlockExtensionResult,
    __MetadataBearer {}
declare const PurchaseCapacityBlockExtensionCommand_base: {
  new (
    input: PurchaseCapacityBlockExtensionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseCapacityBlockExtensionCommandInput,
    PurchaseCapacityBlockExtensionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: PurchaseCapacityBlockExtensionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseCapacityBlockExtensionCommandInput,
    PurchaseCapacityBlockExtensionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class PurchaseCapacityBlockExtensionCommand extends PurchaseCapacityBlockExtensionCommand_base {
  protected static __types: {
    api: {
      input: PurchaseCapacityBlockExtensionRequest;
      output: PurchaseCapacityBlockExtensionResult;
    };
    sdk: {
      input: PurchaseCapacityBlockExtensionCommandInput;
      output: PurchaseCapacityBlockExtensionCommandOutput;
    };
  };
}
