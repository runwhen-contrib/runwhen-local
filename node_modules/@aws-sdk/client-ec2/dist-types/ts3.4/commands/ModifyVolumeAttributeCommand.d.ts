import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ModifyVolumeAttributeRequest } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVolumeAttributeCommandInput
  extends ModifyVolumeAttributeRequest {}
export interface ModifyVolumeAttributeCommandOutput extends __MetadataBearer {}
declare const ModifyVolumeAttributeCommand_base: {
  new (
    input: ModifyVolumeAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVolumeAttributeCommandInput,
    ModifyVolumeAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVolumeAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVolumeAttributeCommandInput,
    ModifyVolumeAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVolumeAttributeCommand extends ModifyVolumeAttributeCommand_base {
  protected static __types: {
    api: {
      input: ModifyVolumeAttributeRequest;
      output: {};
    };
    sdk: {
      input: ModifyVolumeAttributeCommandInput;
      output: ModifyVolumeAttributeCommandOutput;
    };
  };
}
