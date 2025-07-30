import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RevokeSecurityGroupIngressRequest,
  RevokeSecurityGroupIngressResult,
} from "../models/models_8";
export { __MetadataBearer };
export { $Command };
export interface RevokeSecurityGroupIngressCommandInput
  extends RevokeSecurityGroupIngressRequest {}
export interface RevokeSecurityGroupIngressCommandOutput
  extends RevokeSecurityGroupIngressResult,
    __MetadataBearer {}
declare const RevokeSecurityGroupIngressCommand_base: {
  new (
    input: RevokeSecurityGroupIngressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RevokeSecurityGroupIngressCommandInput,
    RevokeSecurityGroupIngressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [RevokeSecurityGroupIngressCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    RevokeSecurityGroupIngressCommandInput,
    RevokeSecurityGroupIngressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RevokeSecurityGroupIngressCommand extends RevokeSecurityGroupIngressCommand_base {
  protected static __types: {
    api: {
      input: RevokeSecurityGroupIngressRequest;
      output: RevokeSecurityGroupIngressResult;
    };
    sdk: {
      input: RevokeSecurityGroupIngressCommandInput;
      output: RevokeSecurityGroupIngressCommandOutput;
    };
  };
}
