import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  MoveCapacityReservationInstancesRequest,
  MoveCapacityReservationInstancesResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface MoveCapacityReservationInstancesCommandInput
  extends MoveCapacityReservationInstancesRequest {}
export interface MoveCapacityReservationInstancesCommandOutput
  extends MoveCapacityReservationInstancesResult,
    __MetadataBearer {}
declare const MoveCapacityReservationInstancesCommand_base: {
  new (
    input: MoveCapacityReservationInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    MoveCapacityReservationInstancesCommandInput,
    MoveCapacityReservationInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: MoveCapacityReservationInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    MoveCapacityReservationInstancesCommandInput,
    MoveCapacityReservationInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class MoveCapacityReservationInstancesCommand extends MoveCapacityReservationInstancesCommand_base {
  protected static __types: {
    api: {
      input: MoveCapacityReservationInstancesRequest;
      output: MoveCapacityReservationInstancesResult;
    };
    sdk: {
      input: MoveCapacityReservationInstancesCommandInput;
      output: MoveCapacityReservationInstancesCommandOutput;
    };
  };
}
