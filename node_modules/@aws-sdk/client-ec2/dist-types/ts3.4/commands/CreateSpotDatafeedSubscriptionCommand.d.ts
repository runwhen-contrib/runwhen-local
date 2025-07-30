import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateSpotDatafeedSubscriptionRequest,
  CreateSpotDatafeedSubscriptionResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateSpotDatafeedSubscriptionCommandInput
  extends CreateSpotDatafeedSubscriptionRequest {}
export interface CreateSpotDatafeedSubscriptionCommandOutput
  extends CreateSpotDatafeedSubscriptionResult,
    __MetadataBearer {}
declare const CreateSpotDatafeedSubscriptionCommand_base: {
  new (
    input: CreateSpotDatafeedSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSpotDatafeedSubscriptionCommandInput,
    CreateSpotDatafeedSubscriptionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateSpotDatafeedSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateSpotDatafeedSubscriptionCommandInput,
    CreateSpotDatafeedSubscriptionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateSpotDatafeedSubscriptionCommand extends CreateSpotDatafeedSubscriptionCommand_base {
  protected static __types: {
    api: {
      input: CreateSpotDatafeedSubscriptionRequest;
      output: CreateSpotDatafeedSubscriptionResult;
    };
    sdk: {
      input: CreateSpotDatafeedSubscriptionCommandInput;
      output: CreateSpotDatafeedSubscriptionCommandOutput;
    };
  };
}
