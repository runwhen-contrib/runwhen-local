import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RejectCapacityReservationBillingOwnershipRequest,
  RejectCapacityReservationBillingOwnershipResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RejectCapacityReservationBillingOwnershipCommandInput
  extends RejectCapacityReservationBillingOwnershipRequest {}
export interface RejectCapacityReservationBillingOwnershipCommandOutput
  extends RejectCapacityReservationBillingOwnershipResult,
    __MetadataBearer {}
declare const RejectCapacityReservationBillingOwnershipCommand_base: {
  new (
    input: RejectCapacityReservationBillingOwnershipCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RejectCapacityReservationBillingOwnershipCommandInput,
    RejectCapacityReservationBillingOwnershipCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RejectCapacityReservationBillingOwnershipCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RejectCapacityReservationBillingOwnershipCommandInput,
    RejectCapacityReservationBillingOwnershipCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RejectCapacityReservationBillingOwnershipCommand extends RejectCapacityReservationBillingOwnershipCommand_base {
  protected static __types: {
    api: {
      input: RejectCapacityReservationBillingOwnershipRequest;
      output: RejectCapacityReservationBillingOwnershipResult;
    };
    sdk: {
      input: RejectCapacityReservationBillingOwnershipCommandInput;
      output: RejectCapacityReservationBillingOwnershipCommandOutput;
    };
  };
}
