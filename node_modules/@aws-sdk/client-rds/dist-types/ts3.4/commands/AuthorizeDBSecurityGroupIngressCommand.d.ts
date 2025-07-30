import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  AuthorizeDBSecurityGroupIngressMessage,
  AuthorizeDBSecurityGroupIngressResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface AuthorizeDBSecurityGroupIngressCommandInput
  extends AuthorizeDBSecurityGroupIngressMessage {}
export interface AuthorizeDBSecurityGroupIngressCommandOutput
  extends AuthorizeDBSecurityGroupIngressResult,
    __MetadataBearer {}
declare const AuthorizeDBSecurityGroupIngressCommand_base: {
  new (
    input: AuthorizeDBSecurityGroupIngressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AuthorizeDBSecurityGroupIngressCommandInput,
    AuthorizeDBSecurityGroupIngressCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AuthorizeDBSecurityGroupIngressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AuthorizeDBSecurityGroupIngressCommandInput,
    AuthorizeDBSecurityGroupIngressCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AuthorizeDBSecurityGroupIngressCommand extends AuthorizeDBSecurityGroupIngressCommand_base {
  protected static __types: {
    api: {
      input: AuthorizeDBSecurityGroupIngressMessage;
      output: AuthorizeDBSecurityGroupIngressResult;
    };
    sdk: {
      input: AuthorizeDBSecurityGroupIngressCommandInput;
      output: AuthorizeDBSecurityGroupIngressCommandOutput;
    };
  };
}
