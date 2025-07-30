import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteVerifiedAccessGroupRequest,
  DeleteVerifiedAccessGroupResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVerifiedAccessGroupCommandInput
  extends DeleteVerifiedAccessGroupRequest {}
export interface DeleteVerifiedAccessGroupCommandOutput
  extends DeleteVerifiedAccessGroupResult,
    __MetadataBearer {}
declare const DeleteVerifiedAccessGroupCommand_base: {
  new (
    input: DeleteVerifiedAccessGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVerifiedAccessGroupCommandInput,
    DeleteVerifiedAccessGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVerifiedAccessGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVerifiedAccessGroupCommandInput,
    DeleteVerifiedAccessGroupCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVerifiedAccessGroupCommand extends DeleteVerifiedAccessGroupCommand_base {
  protected static __types: {
    api: {
      input: DeleteVerifiedAccessGroupRequest;
      output: DeleteVerifiedAccessGroupResult;
    };
    sdk: {
      input: DeleteVerifiedAccessGroupCommandInput;
      output: DeleteVerifiedAccessGroupCommandOutput;
    };
  };
}
