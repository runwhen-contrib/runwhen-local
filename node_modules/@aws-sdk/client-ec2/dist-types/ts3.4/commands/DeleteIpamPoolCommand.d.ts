import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteIpamPoolRequest,
  DeleteIpamPoolResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteIpamPoolCommandInput extends DeleteIpamPoolRequest {}
export interface DeleteIpamPoolCommandOutput
  extends DeleteIpamPoolResult,
    __MetadataBearer {}
declare const DeleteIpamPoolCommand_base: {
  new (
    input: DeleteIpamPoolCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIpamPoolCommandInput,
    DeleteIpamPoolCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteIpamPoolCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIpamPoolCommandInput,
    DeleteIpamPoolCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteIpamPoolCommand extends DeleteIpamPoolCommand_base {
  protected static __types: {
    api: {
      input: DeleteIpamPoolRequest;
      output: DeleteIpamPoolResult;
    };
    sdk: {
      input: DeleteIpamPoolCommandInput;
      output: DeleteIpamPoolCommandOutput;
    };
  };
}
