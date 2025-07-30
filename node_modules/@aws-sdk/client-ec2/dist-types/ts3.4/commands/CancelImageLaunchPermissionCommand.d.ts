import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CancelImageLaunchPermissionRequest,
  CancelImageLaunchPermissionResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CancelImageLaunchPermissionCommandInput
  extends CancelImageLaunchPermissionRequest {}
export interface CancelImageLaunchPermissionCommandOutput
  extends CancelImageLaunchPermissionResult,
    __MetadataBearer {}
declare const CancelImageLaunchPermissionCommand_base: {
  new (
    input: CancelImageLaunchPermissionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelImageLaunchPermissionCommandInput,
    CancelImageLaunchPermissionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CancelImageLaunchPermissionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CancelImageLaunchPermissionCommandInput,
    CancelImageLaunchPermissionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CancelImageLaunchPermissionCommand extends CancelImageLaunchPermissionCommand_base {
  protected static __types: {
    api: {
      input: CancelImageLaunchPermissionRequest;
      output: CancelImageLaunchPermissionResult;
    };
    sdk: {
      input: CancelImageLaunchPermissionCommandInput;
      output: CancelImageLaunchPermissionCommandOutput;
    };
  };
}
