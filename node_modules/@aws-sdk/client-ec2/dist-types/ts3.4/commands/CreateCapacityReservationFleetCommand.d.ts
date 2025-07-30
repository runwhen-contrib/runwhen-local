import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateCapacityReservationFleetRequest,
  CreateCapacityReservationFleetResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateCapacityReservationFleetCommandInput
  extends CreateCapacityReservationFleetRequest {}
export interface CreateCapacityReservationFleetCommandOutput
  extends CreateCapacityReservationFleetResult,
    __MetadataBearer {}
declare const CreateCapacityReservationFleetCommand_base: {
  new (
    input: CreateCapacityReservationFleetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCapacityReservationFleetCommandInput,
    CreateCapacityReservationFleetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateCapacityReservationFleetCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCapacityReservationFleetCommandInput,
    CreateCapacityReservationFleetCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateCapacityReservationFleetCommand extends CreateCapacityReservationFleetCommand_base {
  protected static __types: {
    api: {
      input: CreateCapacityReservationFleetRequest;
      output: CreateCapacityReservationFleetResult;
    };
    sdk: {
      input: CreateCapacityReservationFleetCommandInput;
      output: CreateCapacityReservationFleetCommandOutput;
    };
  };
}
