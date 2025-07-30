import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AcceptCapacityReservationBillingOwnershipRequest,
  AcceptCapacityReservationBillingOwnershipResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AcceptCapacityReservationBillingOwnershipCommandInput
  extends AcceptCapacityReservationBillingOwnershipRequest {}
export interface AcceptCapacityReservationBillingOwnershipCommandOutput
  extends AcceptCapacityReservationBillingOwnershipResult,
    __MetadataBearer {}
declare const AcceptCapacityReservationBillingOwnershipCommand_base: {
  new (
    input: AcceptCapacityReservationBillingOwnershipCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptCapacityReservationBillingOwnershipCommandInput,
    AcceptCapacityReservationBillingOwnershipCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AcceptCapacityReservationBillingOwnershipCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptCapacityReservationBillingOwnershipCommandInput,
    AcceptCapacityReservationBillingOwnershipCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AcceptCapacityReservationBillingOwnershipCommand extends AcceptCapacityReservationBillingOwnershipCommand_base {
  protected static __types: {
    api: {
      input: AcceptCapacityReservationBillingOwnershipRequest;
      output: AcceptCapacityReservationBillingOwnershipResult;
    };
    sdk: {
      input: AcceptCapacityReservationBillingOwnershipCommandInput;
      output: AcceptCapacityReservationBillingOwnershipCommandOutput;
    };
  };
}
