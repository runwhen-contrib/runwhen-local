import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetSecurityGroupsForVpcRequest,
  GetSecurityGroupsForVpcResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetSecurityGroupsForVpcCommandInput
  extends GetSecurityGroupsForVpcRequest {}
export interface GetSecurityGroupsForVpcCommandOutput
  extends GetSecurityGroupsForVpcResult,
    __MetadataBearer {}
declare const GetSecurityGroupsForVpcCommand_base: {
  new (
    input: GetSecurityGroupsForVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetSecurityGroupsForVpcCommandInput,
    GetSecurityGroupsForVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetSecurityGroupsForVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetSecurityGroupsForVpcCommandInput,
    GetSecurityGroupsForVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetSecurityGroupsForVpcCommand extends GetSecurityGroupsForVpcCommand_base {
  protected static __types: {
    api: {
      input: GetSecurityGroupsForVpcRequest;
      output: GetSecurityGroupsForVpcResult;
    };
    sdk: {
      input: GetSecurityGroupsForVpcCommandInput;
      output: GetSecurityGroupsForVpcCommandOutput;
    };
  };
}
