import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  PurchaseCapacityBlockRequest,
  PurchaseCapacityBlockResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface PurchaseCapacityBlockCommandInput
  extends PurchaseCapacityBlockRequest {}
export interface PurchaseCapacityBlockCommandOutput
  extends PurchaseCapacityBlockResult,
    __MetadataBearer {}
declare const PurchaseCapacityBlockCommand_base: {
  new (
    input: PurchaseCapacityBlockCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseCapacityBlockCommandInput,
    PurchaseCapacityBlockCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: PurchaseCapacityBlockCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseCapacityBlockCommandInput,
    PurchaseCapacityBlockCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class PurchaseCapacityBlockCommand extends PurchaseCapacityBlockCommand_base {
  protected static __types: {
    api: {
      input: PurchaseCapacityBlockRequest;
      output: PurchaseCapacityBlockResult;
    };
    sdk: {
      input: PurchaseCapacityBlockCommandInput;
      output: PurchaseCapacityBlockCommandOutput;
    };
  };
}
