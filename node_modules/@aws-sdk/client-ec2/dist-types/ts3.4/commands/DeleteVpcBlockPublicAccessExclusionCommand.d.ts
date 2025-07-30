import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteVpcBlockPublicAccessExclusionRequest,
  DeleteVpcBlockPublicAccessExclusionResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVpcBlockPublicAccessExclusionCommandInput
  extends DeleteVpcBlockPublicAccessExclusionRequest {}
export interface DeleteVpcBlockPublicAccessExclusionCommandOutput
  extends DeleteVpcBlockPublicAccessExclusionResult,
    __MetadataBearer {}
declare const DeleteVpcBlockPublicAccessExclusionCommand_base: {
  new (
    input: DeleteVpcBlockPublicAccessExclusionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcBlockPublicAccessExclusionCommandInput,
    DeleteVpcBlockPublicAccessExclusionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVpcBlockPublicAccessExclusionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcBlockPublicAccessExclusionCommandInput,
    DeleteVpcBlockPublicAccessExclusionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVpcBlockPublicAccessExclusionCommand extends DeleteVpcBlockPublicAccessExclusionCommand_base {
  protected static __types: {
    api: {
      input: DeleteVpcBlockPublicAccessExclusionRequest;
      output: DeleteVpcBlockPublicAccessExclusionResult;
    };
    sdk: {
      input: DeleteVpcBlockPublicAccessExclusionCommandInput;
      output: DeleteVpcBlockPublicAccessExclusionCommandOutput;
    };
  };
}
