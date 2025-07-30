import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteVerifiedAccessInstanceRequest,
  DeleteVerifiedAccessInstanceResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVerifiedAccessInstanceCommandInput
  extends DeleteVerifiedAccessInstanceRequest {}
export interface DeleteVerifiedAccessInstanceCommandOutput
  extends DeleteVerifiedAccessInstanceResult,
    __MetadataBearer {}
declare const DeleteVerifiedAccessInstanceCommand_base: {
  new (
    input: DeleteVerifiedAccessInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVerifiedAccessInstanceCommandInput,
    DeleteVerifiedAccessInstanceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVerifiedAccessInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVerifiedAccessInstanceCommandInput,
    DeleteVerifiedAccessInstanceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVerifiedAccessInstanceCommand extends DeleteVerifiedAccessInstanceCommand_base {
  protected static __types: {
    api: {
      input: DeleteVerifiedAccessInstanceRequest;
      output: DeleteVerifiedAccessInstanceResult;
    };
    sdk: {
      input: DeleteVerifiedAccessInstanceCommandInput;
      output: DeleteVerifiedAccessInstanceCommandOutput;
    };
  };
}
