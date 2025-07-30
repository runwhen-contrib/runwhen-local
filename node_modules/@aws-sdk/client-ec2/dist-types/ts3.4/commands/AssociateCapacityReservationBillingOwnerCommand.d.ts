import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateCapacityReservationBillingOwnerRequest,
  AssociateCapacityReservationBillingOwnerResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateCapacityReservationBillingOwnerCommandInput
  extends AssociateCapacityReservationBillingOwnerRequest {}
export interface AssociateCapacityReservationBillingOwnerCommandOutput
  extends AssociateCapacityReservationBillingOwnerResult,
    __MetadataBearer {}
declare const AssociateCapacityReservationBillingOwnerCommand_base: {
  new (
    input: AssociateCapacityReservationBillingOwnerCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateCapacityReservationBillingOwnerCommandInput,
    AssociateCapacityReservationBillingOwnerCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateCapacityReservationBillingOwnerCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateCapacityReservationBillingOwnerCommandInput,
    AssociateCapacityReservationBillingOwnerCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateCapacityReservationBillingOwnerCommand extends AssociateCapacityReservationBillingOwnerCommand_base {
  protected static __types: {
    api: {
      input: AssociateCapacityReservationBillingOwnerRequest;
      output: AssociateCapacityReservationBillingOwnerResult;
    };
    sdk: {
      input: AssociateCapacityReservationBillingOwnerCommandInput;
      output: AssociateCapacityReservationBillingOwnerCommandOutput;
    };
  };
}
