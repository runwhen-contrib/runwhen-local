import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableImageBlockPublicAccessRequest,
  DisableImageBlockPublicAccessResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DisableImageBlockPublicAccessCommandInput
  extends DisableImageBlockPublicAccessRequest {}
export interface DisableImageBlockPublicAccessCommandOutput
  extends DisableImageBlockPublicAccessResult,
    __MetadataBearer {}
declare const DisableImageBlockPublicAccessCommand_base: {
  new (
    input: DisableImageBlockPublicAccessCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableImageBlockPublicAccessCommandInput,
    DisableImageBlockPublicAccessCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DisableImageBlockPublicAccessCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DisableImageBlockPublicAccessCommandInput,
    DisableImageBlockPublicAccessCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableImageBlockPublicAccessCommand extends DisableImageBlockPublicAccessCommand_base {
  protected static __types: {
    api: {
      input: DisableImageBlockPublicAccessRequest;
      output: DisableImageBlockPublicAccessResult;
    };
    sdk: {
      input: DisableImageBlockPublicAccessCommandInput;
      output: DisableImageBlockPublicAccessCommandOutput;
    };
  };
}
