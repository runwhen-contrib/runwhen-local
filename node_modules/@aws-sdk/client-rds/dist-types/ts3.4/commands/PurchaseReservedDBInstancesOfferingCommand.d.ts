import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  PurchaseReservedDBInstancesOfferingMessage,
  PurchaseReservedDBInstancesOfferingResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface PurchaseReservedDBInstancesOfferingCommandInput
  extends PurchaseReservedDBInstancesOfferingMessage {}
export interface PurchaseReservedDBInstancesOfferingCommandOutput
  extends PurchaseReservedDBInstancesOfferingResult,
    __MetadataBearer {}
declare const PurchaseReservedDBInstancesOfferingCommand_base: {
  new (
    input: PurchaseReservedDBInstancesOfferingCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseReservedDBInstancesOfferingCommandInput,
    PurchaseReservedDBInstancesOfferingCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: PurchaseReservedDBInstancesOfferingCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseReservedDBInstancesOfferingCommandInput,
    PurchaseReservedDBInstancesOfferingCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class PurchaseReservedDBInstancesOfferingCommand extends PurchaseReservedDBInstancesOfferingCommand_base {
  protected static __types: {
    api: {
      input: PurchaseReservedDBInstancesOfferingMessage;
      output: PurchaseReservedDBInstancesOfferingResult;
    };
    sdk: {
      input: PurchaseReservedDBInstancesOfferingCommandInput;
      output: PurchaseReservedDBInstancesOfferingCommandOutput;
    };
  };
}
