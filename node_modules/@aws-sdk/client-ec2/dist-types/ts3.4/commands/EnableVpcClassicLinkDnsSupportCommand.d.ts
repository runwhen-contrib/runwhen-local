import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  EnableVpcClassicLinkDnsSupportRequest,
  EnableVpcClassicLinkDnsSupportResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface EnableVpcClassicLinkDnsSupportCommandInput
  extends EnableVpcClassicLinkDnsSupportRequest {}
export interface EnableVpcClassicLinkDnsSupportCommandOutput
  extends EnableVpcClassicLinkDnsSupportResult,
    __MetadataBearer {}
declare const EnableVpcClassicLinkDnsSupportCommand_base: {
  new (
    input: EnableVpcClassicLinkDnsSupportCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableVpcClassicLinkDnsSupportCommandInput,
    EnableVpcClassicLinkDnsSupportCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [EnableVpcClassicLinkDnsSupportCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    EnableVpcClassicLinkDnsSupportCommandInput,
    EnableVpcClassicLinkDnsSupportCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class EnableVpcClassicLinkDnsSupportCommand extends EnableVpcClassicLinkDnsSupportCommand_base {
  protected static __types: {
    api: {
      input: EnableVpcClassicLinkDnsSupportRequest;
      output: EnableVpcClassicLinkDnsSupportResult;
    };
    sdk: {
      input: EnableVpcClassicLinkDnsSupportCommandInput;
      output: EnableVpcClassicLinkDnsSupportCommandOutput;
    };
  };
}
