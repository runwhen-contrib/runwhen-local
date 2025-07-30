import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CancelReservedInstancesListingRequest,
  CancelReservedInstancesListingResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CancelReservedInstancesListingCommandInput
  extends CancelReservedInstancesListingRequest {}
export interface CancelReservedInstancesListingCommandOutput
  extends CancelReservedInstancesListingResult,
    __MetadataBearer {}
declare const CancelReservedInstancesListingCommand_base: {
  new (
    input: CancelReservedInstancesListingCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelReservedInstancesListingCommandInput,
    CancelReservedInstancesListingCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CancelReservedInstancesListingCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelReservedInstancesListingCommandInput,
    CancelReservedInstancesListingCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CancelReservedInstancesListingCommand extends CancelReservedInstancesListingCommand_base {
  protected static __types: {
    api: {
      input: CancelReservedInstancesListingRequest;
      output: CancelReservedInstancesListingResult;
    };
    sdk: {
      input: CancelReservedInstancesListingCommandInput;
      output: CancelReservedInstancesListingCommandOutput;
    };
  };
}
