import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  PurchaseReservedInstancesOfferingRequest,
  PurchaseReservedInstancesOfferingResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface PurchaseReservedInstancesOfferingCommandInput
  extends PurchaseReservedInstancesOfferingRequest {}
export interface PurchaseReservedInstancesOfferingCommandOutput
  extends PurchaseReservedInstancesOfferingResult,
    __MetadataBearer {}
declare const PurchaseReservedInstancesOfferingCommand_base: {
  new (
    input: PurchaseReservedInstancesOfferingCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseReservedInstancesOfferingCommandInput,
    PurchaseReservedInstancesOfferingCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: PurchaseReservedInstancesOfferingCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseReservedInstancesOfferingCommandInput,
    PurchaseReservedInstancesOfferingCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class PurchaseReservedInstancesOfferingCommand extends PurchaseReservedInstancesOfferingCommand_base {
  protected static __types: {
    api: {
      input: PurchaseReservedInstancesOfferingRequest;
      output: PurchaseReservedInstancesOfferingResult;
    };
    sdk: {
      input: PurchaseReservedInstancesOfferingCommandInput;
      output: PurchaseReservedInstancesOfferingCommandOutput;
    };
  };
}
