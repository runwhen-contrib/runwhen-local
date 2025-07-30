import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  EnableVpcClassicLinkRequest,
  EnableVpcClassicLinkResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface EnableVpcClassicLinkCommandInput
  extends EnableVpcClassicLinkRequest {}
export interface EnableVpcClassicLinkCommandOutput
  extends EnableVpcClassicLinkResult,
    __MetadataBearer {}
declare const EnableVpcClassicLinkCommand_base: {
  new (
    input: EnableVpcClassicLinkCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableVpcClassicLinkCommandInput,
    EnableVpcClassicLinkCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: EnableVpcClassicLinkCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableVpcClassicLinkCommandInput,
    EnableVpcClassicLinkCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class EnableVpcClassicLinkCommand extends EnableVpcClassicLinkCommand_base {
  protected static __types: {
    api: {
      input: EnableVpcClassicLinkRequest;
      output: EnableVpcClassicLinkResult;
    };
    sdk: {
      input: EnableVpcClassicLinkCommandInput;
      output: EnableVpcClassicLinkCommandOutput;
    };
  };
}
