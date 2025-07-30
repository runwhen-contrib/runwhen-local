import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteIpamScopeRequest,
  DeleteIpamScopeResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteIpamScopeCommandInput extends DeleteIpamScopeRequest {}
export interface DeleteIpamScopeCommandOutput
  extends DeleteIpamScopeResult,
    __MetadataBearer {}
declare const DeleteIpamScopeCommand_base: {
  new (
    input: DeleteIpamScopeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIpamScopeCommandInput,
    DeleteIpamScopeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteIpamScopeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIpamScopeCommandInput,
    DeleteIpamScopeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteIpamScopeCommand extends DeleteIpamScopeCommand_base {
  protected static __types: {
    api: {
      input: DeleteIpamScopeRequest;
      output: DeleteIpamScopeResult;
    };
    sdk: {
      input: DeleteIpamScopeCommandInput;
      output: DeleteIpamScopeCommandOutput;
    };
  };
}
