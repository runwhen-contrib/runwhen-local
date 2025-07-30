import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateCapacityReservationBySplittingRequest,
  CreateCapacityReservationBySplittingResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateCapacityReservationBySplittingCommandInput
  extends CreateCapacityReservationBySplittingRequest {}
export interface CreateCapacityReservationBySplittingCommandOutput
  extends CreateCapacityReservationBySplittingResult,
    __MetadataBearer {}
declare const CreateCapacityReservationBySplittingCommand_base: {
  new (
    input: CreateCapacityReservationBySplittingCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCapacityReservationBySplittingCommandInput,
    CreateCapacityReservationBySplittingCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateCapacityReservationBySplittingCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateCapacityReservationBySplittingCommandInput,
    CreateCapacityReservationBySplittingCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateCapacityReservationBySplittingCommand extends CreateCapacityReservationBySplittingCommand_base {
  protected static __types: {
    api: {
      input: CreateCapacityReservationBySplittingRequest;
      output: CreateCapacityReservationBySplittingResult;
    };
    sdk: {
      input: CreateCapacityReservationBySplittingCommandInput;
      output: CreateCapacityReservationBySplittingCommandOutput;
    };
  };
}
