import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ModifyVolumeRequest, ModifyVolumeResult } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyVolumeCommandInput extends ModifyVolumeRequest {}
export interface ModifyVolumeCommandOutput
  extends ModifyVolumeResult,
    __MetadataBearer {}
declare const ModifyVolumeCommand_base: {
  new (
    input: ModifyVolumeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVolumeCommandInput,
    ModifyVolumeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyVolumeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyVolumeCommandInput,
    ModifyVolumeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyVolumeCommand extends ModifyVolumeCommand_base {
  protected static __types: {
    api: {
      input: ModifyVolumeRequest;
      output: ModifyVolumeResult;
    };
    sdk: {
      input: ModifyVolumeCommandInput;
      output: ModifyVolumeCommandOutput;
    };
  };
}
