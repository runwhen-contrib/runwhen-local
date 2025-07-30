import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AuthorizeSecurityGroupIngressRequest,
  AuthorizeSecurityGroupIngressResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AuthorizeSecurityGroupIngressCommandInput
  extends AuthorizeSecurityGroupIngressRequest {}
export interface AuthorizeSecurityGroupIngressCommandOutput
  extends AuthorizeSecurityGroupIngressResult,
    __MetadataBearer {}
declare const AuthorizeSecurityGroupIngressCommand_base: {
  new (
    input: AuthorizeSecurityGroupIngressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AuthorizeSecurityGroupIngressCommandInput,
    AuthorizeSecurityGroupIngressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [AuthorizeSecurityGroupIngressCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    AuthorizeSecurityGroupIngressCommandInput,
    AuthorizeSecurityGroupIngressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AuthorizeSecurityGroupIngressCommand extends AuthorizeSecurityGroupIngressCommand_base {
  protected static __types: {
    api: {
      input: AuthorizeSecurityGroupIngressRequest;
      output: AuthorizeSecurityGroupIngressResult;
    };
    sdk: {
      input: AuthorizeSecurityGroupIngressCommandInput;
      output: AuthorizeSecurityGroupIngressCommandOutput;
    };
  };
}
