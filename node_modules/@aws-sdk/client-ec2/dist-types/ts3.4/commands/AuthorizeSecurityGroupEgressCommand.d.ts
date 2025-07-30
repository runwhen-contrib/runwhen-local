import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AuthorizeSecurityGroupEgressRequest,
  AuthorizeSecurityGroupEgressResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AuthorizeSecurityGroupEgressCommandInput
  extends AuthorizeSecurityGroupEgressRequest {}
export interface AuthorizeSecurityGroupEgressCommandOutput
  extends AuthorizeSecurityGroupEgressResult,
    __MetadataBearer {}
declare const AuthorizeSecurityGroupEgressCommand_base: {
  new (
    input: AuthorizeSecurityGroupEgressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AuthorizeSecurityGroupEgressCommandInput,
    AuthorizeSecurityGroupEgressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AuthorizeSecurityGroupEgressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AuthorizeSecurityGroupEgressCommandInput,
    AuthorizeSecurityGroupEgressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AuthorizeSecurityGroupEgressCommand extends AuthorizeSecurityGroupEgressCommand_base {
  protected static __types: {
    api: {
      input: AuthorizeSecurityGroupEgressRequest;
      output: AuthorizeSecurityGroupEgressResult;
    };
    sdk: {
      input: AuthorizeSecurityGroupEgressCommandInput;
      output: AuthorizeSecurityGroupEgressCommandOutput;
    };
  };
}
