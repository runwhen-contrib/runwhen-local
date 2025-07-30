import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CancelCapacityReservationRequest,
  CancelCapacityReservationResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CancelCapacityReservationCommandInput
  extends CancelCapacityReservationRequest {}
export interface CancelCapacityReservationCommandOutput
  extends CancelCapacityReservationResult,
    __MetadataBearer {}
declare const CancelCapacityReservationCommand_base: {
  new (
    input: CancelCapacityReservationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelCapacityReservationCommandInput,
    CancelCapacityReservationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CancelCapacityReservationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelCapacityReservationCommandInput,
    CancelCapacityReservationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CancelCapacityReservationCommand extends CancelCapacityReservationCommand_base {
  protected static __types: {
    api: {
      input: CancelCapacityReservationRequest;
      output: CancelCapacityReservationResult;
    };
    sdk: {
      input: CancelCapacityReservationCommandInput;
      output: CancelCapacityReservationCommandOutput;
    };
  };
}
