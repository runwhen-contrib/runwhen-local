import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetGroupsForCapacityReservationRequest,
  GetGroupsForCapacityReservationResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetGroupsForCapacityReservationCommandInput
  extends GetGroupsForCapacityReservationRequest {}
export interface GetGroupsForCapacityReservationCommandOutput
  extends GetGroupsForCapacityReservationResult,
    __MetadataBearer {}
declare const GetGroupsForCapacityReservationCommand_base: {
  new (
    input: GetGroupsForCapacityReservationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetGroupsForCapacityReservationCommandInput,
    GetGroupsForCapacityReservationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetGroupsForCapacityReservationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetGroupsForCapacityReservationCommandInput,
    GetGroupsForCapacityReservationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetGroupsForCapacityReservationCommand extends GetGroupsForCapacityReservationCommand_base {
  protected static __types: {
    api: {
      input: GetGroupsForCapacityReservationRequest;
      output: GetGroupsForCapacityReservationResult;
    };
    sdk: {
      input: GetGroupsForCapacityReservationCommandInput;
      output: GetGroupsForCapacityReservationCommandOutput;
    };
  };
}
