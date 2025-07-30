import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateSubnetCidrReservationRequest,
  CreateSubnetCidrReservationResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateSubnetCidrReservationCommandInput
  extends CreateSubnetCidrReservationRequest {}
export interface CreateSubnetCidrReservationCommandOutput
  extends CreateSubnetCidrReservationResult,
    __MetadataBearer {}
declare const CreateSubnetCidrReservationCommand_base: {
  new (
    input: CreateSubnetCidrReservationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSubnetCidrReservationCommandInput,
    CreateSubnetCidrReservationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateSubnetCidrReservationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSubnetCidrReservationCommandInput,
    CreateSubnetCidrReservationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateSubnetCidrReservationCommand extends CreateSubnetCidrReservationCommand_base {
  protected static __types: {
    api: {
      input: CreateSubnetCidrReservationRequest;
      output: CreateSubnetCidrReservationResult;
    };
    sdk: {
      input: CreateSubnetCidrReservationCommandInput;
      output: CreateSubnetCidrReservationCommandOutput;
    };
  };
}
