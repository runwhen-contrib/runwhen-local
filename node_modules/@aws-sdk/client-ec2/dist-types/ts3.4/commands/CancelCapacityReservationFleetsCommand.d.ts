import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CancelCapacityReservationFleetsRequest,
  CancelCapacityReservationFleetsResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CancelCapacityReservationFleetsCommandInput
  extends CancelCapacityReservationFleetsRequest {}
export interface CancelCapacityReservationFleetsCommandOutput
  extends CancelCapacityReservationFleetsResult,
    __MetadataBearer {}
declare const CancelCapacityReservationFleetsCommand_base: {
  new (
    input: CancelCapacityReservationFleetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelCapacityReservationFleetsCommandInput,
    CancelCapacityReservationFleetsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CancelCapacityReservationFleetsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelCapacityReservationFleetsCommandInput,
    CancelCapacityReservationFleetsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CancelCapacityReservationFleetsCommand extends CancelCapacityReservationFleetsCommand_base {
  protected static __types: {
    api: {
      input: CancelCapacityReservationFleetsRequest;
      output: CancelCapacityReservationFleetsResult;
    };
    sdk: {
      input: CancelCapacityReservationFleetsCommandInput;
      output: CancelCapacityReservationFleetsCommandOutput;
    };
  };
}
