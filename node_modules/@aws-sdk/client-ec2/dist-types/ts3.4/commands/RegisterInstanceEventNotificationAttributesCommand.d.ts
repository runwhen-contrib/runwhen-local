import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RegisterInstanceEventNotificationAttributesRequest,
  RegisterInstanceEventNotificationAttributesResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RegisterInstanceEventNotificationAttributesCommandInput
  extends RegisterInstanceEventNotificationAttributesRequest {}
export interface RegisterInstanceEventNotificationAttributesCommandOutput
  extends RegisterInstanceEventNotificationAttributesResult,
    __MetadataBearer {}
declare const RegisterInstanceEventNotificationAttributesCommand_base: {
  new (
    input: RegisterInstanceEventNotificationAttributesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RegisterInstanceEventNotificationAttributesCommandInput,
    RegisterInstanceEventNotificationAttributesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RegisterInstanceEventNotificationAttributesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RegisterInstanceEventNotificationAttributesCommandInput,
    RegisterInstanceEventNotificationAttributesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RegisterInstanceEventNotificationAttributesCommand extends RegisterInstanceEventNotificationAttributesCommand_base {
  protected static __types: {
    api: {
      input: RegisterInstanceEventNotificationAttributesRequest;
      output: RegisterInstanceEventNotificationAttributesResult;
    };
    sdk: {
      input: RegisterInstanceEventNotificationAttributesCommandInput;
      output: RegisterInstanceEventNotificationAttributesCommandOutput;
    };
  };
}
