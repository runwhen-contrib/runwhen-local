import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableVpcClassicLinkDnsSupportRequest,
  DisableVpcClassicLinkDnsSupportResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface DisableVpcClassicLinkDnsSupportCommandInput
  extends DisableVpcClassicLinkDnsSupportRequest {}
export interface DisableVpcClassicLinkDnsSupportCommandOutput
  extends DisableVpcClassicLinkDnsSupportResult,
    __MetadataBearer {}
declare const DisableVpcClassicLinkDnsSupportCommand_base: {
  new (
    input: DisableVpcClassicLinkDnsSupportCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableVpcClassicLinkDnsSupportCommandInput,
    DisableVpcClassicLinkDnsSupportCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DisableVpcClassicLinkDnsSupportCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DisableVpcClassicLinkDnsSupportCommandInput,
    DisableVpcClassicLinkDnsSupportCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableVpcClassicLinkDnsSupportCommand extends DisableVpcClassicLinkDnsSupportCommand_base {
  protected static __types: {
    api: {
      input: DisableVpcClassicLinkDnsSupportRequest;
      output: DisableVpcClassicLinkDnsSupportResult;
    };
    sdk: {
      input: DisableVpcClassicLinkDnsSupportCommandInput;
      output: DisableVpcClassicLinkDnsSupportCommandOutput;
    };
  };
}
