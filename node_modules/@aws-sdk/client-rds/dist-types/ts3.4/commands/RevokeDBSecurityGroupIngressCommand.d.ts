import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RevokeDBSecurityGroupIngressMessage,
  RevokeDBSecurityGroupIngressResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RevokeDBSecurityGroupIngressCommandInput
  extends RevokeDBSecurityGroupIngressMessage {}
export interface RevokeDBSecurityGroupIngressCommandOutput
  extends RevokeDBSecurityGroupIngressResult,
    __MetadataBearer {}
declare const RevokeDBSecurityGroupIngressCommand_base: {
  new (
    input: RevokeDBSecurityGroupIngressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RevokeDBSecurityGroupIngressCommandInput,
    RevokeDBSecurityGroupIngressCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RevokeDBSecurityGroupIngressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RevokeDBSecurityGroupIngressCommandInput,
    RevokeDBSecurityGroupIngressCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RevokeDBSecurityGroupIngressCommand extends RevokeDBSecurityGroupIngressCommand_base {
  protected static __types: {
    api: {
      input: RevokeDBSecurityGroupIngressMessage;
      output: RevokeDBSecurityGroupIngressResult;
    };
    sdk: {
      input: RevokeDBSecurityGroupIngressCommandInput;
      output: RevokeDBSecurityGroupIngressCommandOutput;
    };
  };
}
