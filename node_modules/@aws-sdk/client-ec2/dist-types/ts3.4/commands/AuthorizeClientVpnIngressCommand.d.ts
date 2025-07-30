import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AuthorizeClientVpnIngressRequest,
  AuthorizeClientVpnIngressResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AuthorizeClientVpnIngressCommandInput
  extends AuthorizeClientVpnIngressRequest {}
export interface AuthorizeClientVpnIngressCommandOutput
  extends AuthorizeClientVpnIngressResult,
    __MetadataBearer {}
declare const AuthorizeClientVpnIngressCommand_base: {
  new (
    input: AuthorizeClientVpnIngressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AuthorizeClientVpnIngressCommandInput,
    AuthorizeClientVpnIngressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AuthorizeClientVpnIngressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AuthorizeClientVpnIngressCommandInput,
    AuthorizeClientVpnIngressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AuthorizeClientVpnIngressCommand extends AuthorizeClientVpnIngressCommand_base {
  protected static __types: {
    api: {
      input: AuthorizeClientVpnIngressRequest;
      output: AuthorizeClientVpnIngressResult;
    };
    sdk: {
      input: AuthorizeClientVpnIngressCommandInput;
      output: AuthorizeClientVpnIngressCommandOutput;
    };
  };
}
