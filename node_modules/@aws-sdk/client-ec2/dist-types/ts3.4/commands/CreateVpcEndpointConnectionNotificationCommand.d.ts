import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateVpcEndpointConnectionNotificationRequest,
  CreateVpcEndpointConnectionNotificationResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateVpcEndpointConnectionNotificationCommandInput
  extends CreateVpcEndpointConnectionNotificationRequest {}
export interface CreateVpcEndpointConnectionNotificationCommandOutput
  extends CreateVpcEndpointConnectionNotificationResult,
    __MetadataBearer {}
declare const CreateVpcEndpointConnectionNotificationCommand_base: {
  new (
    input: CreateVpcEndpointConnectionNotificationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcEndpointConnectionNotificationCommandInput,
    CreateVpcEndpointConnectionNotificationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateVpcEndpointConnectionNotificationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcEndpointConnectionNotificationCommandInput,
    CreateVpcEndpointConnectionNotificationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateVpcEndpointConnectionNotificationCommand extends CreateVpcEndpointConnectionNotificationCommand_base {
  protected static __types: {
    api: {
      input: CreateVpcEndpointConnectionNotificationRequest;
      output: CreateVpcEndpointConnectionNotificationResult;
    };
    sdk: {
      input: CreateVpcEndpointConnectionNotificationCommandInput;
      output: CreateVpcEndpointConnectionNotificationCommandOutput;
    };
  };
}
