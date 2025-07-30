import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteSpotDatafeedSubscriptionRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteSpotDatafeedSubscriptionCommandInput
  extends DeleteSpotDatafeedSubscriptionRequest {}
export interface DeleteSpotDatafeedSubscriptionCommandOutput
  extends __MetadataBearer {}
declare const DeleteSpotDatafeedSubscriptionCommand_base: {
  new (
    input: DeleteSpotDatafeedSubscriptionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteSpotDatafeedSubscriptionCommandInput,
    DeleteSpotDatafeedSubscriptionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DeleteSpotDatafeedSubscriptionCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteSpotDatafeedSubscriptionCommandInput,
    DeleteSpotDatafeedSubscriptionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteSpotDatafeedSubscriptionCommand extends DeleteSpotDatafeedSubscriptionCommand_base {
  protected static __types: {
    api: {
      input: DeleteSpotDatafeedSubscriptionRequest;
      output: {};
    };
    sdk: {
      input: DeleteSpotDatafeedSubscriptionCommandInput;
      output: DeleteSpotDatafeedSubscriptionCommandOutput;
    };
  };
}
