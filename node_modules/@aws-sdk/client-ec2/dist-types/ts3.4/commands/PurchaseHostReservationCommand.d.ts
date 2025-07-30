import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  PurchaseHostReservationRequest,
  PurchaseHostReservationResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface PurchaseHostReservationCommandInput
  extends PurchaseHostReservationRequest {}
export interface PurchaseHostReservationCommandOutput
  extends PurchaseHostReservationResult,
    __MetadataBearer {}
declare const PurchaseHostReservationCommand_base: {
  new (
    input: PurchaseHostReservationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseHostReservationCommandInput,
    PurchaseHostReservationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: PurchaseHostReservationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PurchaseHostReservationCommandInput,
    PurchaseHostReservationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class PurchaseHostReservationCommand extends PurchaseHostReservationCommand_base {
  protected static __types: {
    api: {
      input: PurchaseHostReservationRequest;
      output: PurchaseHostReservationResult;
    };
    sdk: {
      input: PurchaseHostReservationCommandInput;
      output: PurchaseHostReservationCommandOutput;
    };
  };
}
