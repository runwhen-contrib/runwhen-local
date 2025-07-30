import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeregisterInstanceEventNotificationAttributesRequest,
  DeregisterInstanceEventNotificationAttributesResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeregisterInstanceEventNotificationAttributesCommandInput
  extends DeregisterInstanceEventNotificationAttributesRequest {}
export interface DeregisterInstanceEventNotificationAttributesCommandOutput
  extends DeregisterInstanceEventNotificationAttributesResult,
    __MetadataBearer {}
declare const DeregisterInstanceEventNotificationAttributesCommand_base: {
  new (
    input: DeregisterInstanceEventNotificationAttributesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeregisterInstanceEventNotificationAttributesCommandInput,
    DeregisterInstanceEventNotificationAttributesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeregisterInstanceEventNotificationAttributesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeregisterInstanceEventNotificationAttributesCommandInput,
    DeregisterInstanceEventNotificationAttributesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeregisterInstanceEventNotificationAttributesCommand extends DeregisterInstanceEventNotificationAttributesCommand_base {
  protected static __types: {
    api: {
      input: DeregisterInstanceEventNotificationAttributesRequest;
      output: DeregisterInstanceEventNotificationAttributesResult;
    };
    sdk: {
      input: DeregisterInstanceEventNotificationAttributesCommandInput;
      output: DeregisterInstanceEventNotificationAttributesCommandOutput;
    };
  };
}
