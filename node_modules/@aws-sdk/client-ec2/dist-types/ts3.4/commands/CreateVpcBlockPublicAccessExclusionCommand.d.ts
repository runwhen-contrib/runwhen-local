import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateVpcBlockPublicAccessExclusionRequest,
  CreateVpcBlockPublicAccessExclusionResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateVpcBlockPublicAccessExclusionCommandInput
  extends CreateVpcBlockPublicAccessExclusionRequest {}
export interface CreateVpcBlockPublicAccessExclusionCommandOutput
  extends CreateVpcBlockPublicAccessExclusionResult,
    __MetadataBearer {}
declare const CreateVpcBlockPublicAccessExclusionCommand_base: {
  new (
    input: CreateVpcBlockPublicAccessExclusionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcBlockPublicAccessExclusionCommandInput,
    CreateVpcBlockPublicAccessExclusionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateVpcBlockPublicAccessExclusionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVpcBlockPublicAccessExclusionCommandInput,
    CreateVpcBlockPublicAccessExclusionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateVpcBlockPublicAccessExclusionCommand extends CreateVpcBlockPublicAccessExclusionCommand_base {
  protected static __types: {
    api: {
      input: CreateVpcBlockPublicAccessExclusionRequest;
      output: CreateVpcBlockPublicAccessExclusionResult;
    };
    sdk: {
      input: CreateVpcBlockPublicAccessExclusionCommandInput;
      output: CreateVpcBlockPublicAccessExclusionCommandOutput;
    };
  };
}
