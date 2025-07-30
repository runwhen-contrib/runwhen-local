import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateReservedInstancesListingRequest,
  CreateReservedInstancesListingResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateReservedInstancesListingCommandInput
  extends CreateReservedInstancesListingRequest {}
export interface CreateReservedInstancesListingCommandOutput
  extends CreateReservedInstancesListingResult,
    __MetadataBearer {}
declare const CreateReservedInstancesListingCommand_base: {
  new (
    input: CreateReservedInstancesListingCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateReservedInstancesListingCommandInput,
    CreateReservedInstancesListingCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateReservedInstancesListingCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateReservedInstancesListingCommandInput,
    CreateReservedInstancesListingCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateReservedInstancesListingCommand extends CreateReservedInstancesListingCommand_base {
  protected static __types: {
    api: {
      input: CreateReservedInstancesListingRequest;
      output: CreateReservedInstancesListingResult;
    };
    sdk: {
      input: CreateReservedInstancesListingCommandInput;
      output: CreateReservedInstancesListingCommandOutput;
    };
  };
}
