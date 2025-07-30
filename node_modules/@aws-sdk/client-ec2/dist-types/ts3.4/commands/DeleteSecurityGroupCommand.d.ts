import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteSecurityGroupRequest,
  DeleteSecurityGroupResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteSecurityGroupCommandInput
  extends DeleteSecurityGroupRequest {}
export interface DeleteSecurityGroupCommandOutput
  extends DeleteSecurityGroupResult,
    __MetadataBearer {}
declare const DeleteSecurityGroupCommand_base: {
  new (
    input: DeleteSecurityGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteSecurityGroupCommandInput,
    DeleteSecurityGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DeleteSecurityGroupCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteSecurityGroupCommandInput,
    DeleteSecurityGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteSecurityGroupCommand extends DeleteSecurityGroupCommand_base {
  protected static __types: {
    api: {
      input: DeleteSecurityGroupRequest;
      output: DeleteSecurityGroupResult;
    };
    sdk: {
      input: DeleteSecurityGroupCommandInput;
      output: DeleteSecurityGroupCommandOutput;
    };
  };
}
