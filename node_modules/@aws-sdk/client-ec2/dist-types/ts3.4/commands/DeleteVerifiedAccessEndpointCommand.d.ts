import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteVerifiedAccessEndpointRequest,
  DeleteVerifiedAccessEndpointResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVerifiedAccessEndpointCommandInput
  extends DeleteVerifiedAccessEndpointRequest {}
export interface DeleteVerifiedAccessEndpointCommandOutput
  extends DeleteVerifiedAccessEndpointResult,
    __MetadataBearer {}
declare const DeleteVerifiedAccessEndpointCommand_base: {
  new (
    input: DeleteVerifiedAccessEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVerifiedAccessEndpointCommandInput,
    DeleteVerifiedAccessEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVerifiedAccessEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVerifiedAccessEndpointCommandInput,
    DeleteVerifiedAccessEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVerifiedAccessEndpointCommand extends DeleteVerifiedAccessEndpointCommand_base {
  protected static __types: {
    api: {
      input: DeleteVerifiedAccessEndpointRequest;
      output: DeleteVerifiedAccessEndpointResult;
    };
    sdk: {
      input: DeleteVerifiedAccessEndpointCommandInput;
      output: DeleteVerifiedAccessEndpointCommandOutput;
    };
  };
}
