import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyVpcPeeringConnectionOptionsRequest,
  ModifyVpcPeeringConnectionOptionsResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVpcPeeringConnectionOptionsCommandInput
  extends ModifyVpcPeeringConnectionOptionsRequest {}
export interface ModifyVpcPeeringConnectionOptionsCommandOutput
  extends ModifyVpcPeeringConnectionOptionsResult,
    __MetadataBearer {}
declare const ModifyVpcPeeringConnectionOptionsCommand_base: {
  new (
    input: ModifyVpcPeeringConnectionOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcPeeringConnectionOptionsCommandInput,
    ModifyVpcPeeringConnectionOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVpcPeeringConnectionOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVpcPeeringConnectionOptionsCommandInput,
    ModifyVpcPeeringConnectionOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVpcPeeringConnectionOptionsCommand extends ModifyVpcPeeringConnectionOptionsCommand_base {
  protected static __types: {
    api: {
      input: ModifyVpcPeeringConnectionOptionsRequest;
      output: ModifyVpcPeeringConnectionOptionsResult;
    };
    sdk: {
      input: ModifyVpcPeeringConnectionOptionsCommandInput;
      output: ModifyVpcPeeringConnectionOptionsCommandOutput;
    };
  };
}
