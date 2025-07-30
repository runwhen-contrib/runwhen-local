import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteNetworkAclRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteNetworkAclCommandInput extends DeleteNetworkAclRequest {}
export interface DeleteNetworkAclCommandOutput extends __MetadataBearer {}
declare const DeleteNetworkAclCommand_base: {
  new (
    input: DeleteNetworkAclCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkAclCommandInput,
    DeleteNetworkAclCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteNetworkAclCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteNetworkAclCommandInput,
    DeleteNetworkAclCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteNetworkAclCommand extends DeleteNetworkAclCommand_base {
  protected static __types: {
    api: {
      input: DeleteNetworkAclRequest;
      output: {};
    };
    sdk: {
      input: DeleteNetworkAclCommandInput;
      output: DeleteNetworkAclCommandOutput;
    };
  };
}
