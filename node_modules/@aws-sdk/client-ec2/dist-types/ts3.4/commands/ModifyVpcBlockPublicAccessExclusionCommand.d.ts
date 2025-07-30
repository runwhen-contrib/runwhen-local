import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpcBlockPublicAccessExclusionRequest,
  ModifyVpcBlockPublicAccessExclusionResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpcBlockPublicAccessExclusionCommandInput
  extends ModifyVpcBlockPublicAccessExclusionRequest {}
export interface ModifyVpcBlockPublicAccessExclusionCommandOutput
  extends ModifyVpcBlockPublicAccessExclusionResult,
    __MetadataBearer {}
declare const ModifyVpcBlockPublicAccessExclusionCommand_base: {
  new (
    input: ModifyVpcBlockPublicAccessExclusionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcBlockPublicAccessExclusionCommandInput,
    ModifyVpcBlockPublicAccessExclusionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpcBlockPublicAccessExclusionCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcBlockPublicAccessExclusionCommandInput,
    ModifyVpcBlockPublicAccessExclusionCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpcBlockPublicAccessExclusionCommand extends ModifyVpcBlockPublicAccessExclusionCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpcBlockPublicAccessExclusionRequest;
      output: ModifyVpcBlockPublicAccessExclusionResult;
    };
    sdk: {
      input: ModifyVpcBlockPublicAccessExclusionCommandInput;
      output: ModifyVpcBlockPublicAccessExclusionCommandOutput;
    };
  };
}
