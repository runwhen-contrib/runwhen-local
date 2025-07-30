import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpcEndpointConnectionNotificationRequest,
  ModifyVpcEndpointConnectionNotificationResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpcEndpointConnectionNotificationCommandInput
  extends ModifyVpcEndpointConnectionNotificationRequest {}
export interface ModifyVpcEndpointConnectionNotificationCommandOutput
  extends ModifyVpcEndpointConnectionNotificationResult,
    __MetadataBearer {}
declare const ModifyVpcEndpointConnectionNotificationCommand_base: {
  new (
    input: ModifyVpcEndpointConnectionNotificationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcEndpointConnectionNotificationCommandInput,
    ModifyVpcEndpointConnectionNotificationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpcEndpointConnectionNotificationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcEndpointConnectionNotificationCommandInput,
    ModifyVpcEndpointConnectionNotificationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpcEndpointConnectionNotificationCommand extends ModifyVpcEndpointConnectionNotificationCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpcEndpointConnectionNotificationRequest;
      output: ModifyVpcEndpointConnectionNotificationResult;
    };
    sdk: {
      input: ModifyVpcEndpointConnectionNotificationCommandInput;
      output: ModifyVpcEndpointConnectionNotificationCommandOutput;
    };
  };
}
