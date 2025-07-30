import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpcBlockPublicAccessOptionsRequest,
  ModifyVpcBlockPublicAccessOptionsResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpcBlockPublicAccessOptionsCommandInput
  extends ModifyVpcBlockPublicAccessOptionsRequest {}
export interface ModifyVpcBlockPublicAccessOptionsCommandOutput
  extends ModifyVpcBlockPublicAccessOptionsResult,
    __MetadataBearer {}
declare const ModifyVpcBlockPublicAccessOptionsCommand_base: {
  new (
    input: ModifyVpcBlockPublicAccessOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcBlockPublicAccessOptionsCommandInput,
    ModifyVpcBlockPublicAccessOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpcBlockPublicAccessOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcBlockPublicAccessOptionsCommandInput,
    ModifyVpcBlockPublicAccessOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpcBlockPublicAccessOptionsCommand extends ModifyVpcBlockPublicAccessOptionsCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpcBlockPublicAccessOptionsRequest;
      output: ModifyVpcBlockPublicAccessOptionsResult;
    };
    sdk: {
      input: ModifyVpcBlockPublicAccessOptionsCommandInput;
      output: ModifyVpcBlockPublicAccessOptionsCommandOutput;
    };
  };
}
