import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetCapacityReservationUsageRequest,
  GetCapacityReservationUsageResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetCapacityReservationUsageCommandInput
  extends GetCapacityReservationUsageRequest {}
export interface GetCapacityReservationUsageCommandOutput
  extends GetCapacityReservationUsageResult,
    __MetadataBearer {}
declare const GetCapacityReservationUsageCommand_base: {
  new (
    input: GetCapacityReservationUsageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetCapacityReservationUsageCommandInput,
    GetCapacityReservationUsageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetCapacityReservationUsageCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetCapacityReservationUsageCommandInput,
    GetCapacityReservationUsageCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetCapacityReservationUsageCommand extends GetCapacityReservationUsageCommand_base {
  protected static __types: {
    api: {
      input: GetCapacityReservationUsageRequest;
      output: GetCapacityReservationUsageResult;
    };
    sdk: {
      input: GetCapacityReservationUsageCommandInput;
      output: GetCapacityReservationUsageCommandOutput;
    };
  };
}
