import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { VolumeAttachment } from "../models/models_0";
import { DetachVolumeRequest } from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DetachVolumeCommandInput extends DetachVolumeRequest {}
export interface DetachVolumeCommandOutput
  extends VolumeAttachment,
    __MetadataBearer {}
declare const DetachVolumeCommand_base: {
  new (
    input: DetachVolumeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachVolumeCommandInput,
    DetachVolumeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DetachVolumeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachVolumeCommandInput,
    DetachVolumeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DetachVolumeCommand extends DetachVolumeCommand_base {
  protected static __types: {
    api: {
      input: DetachVolumeRequest;
      output: VolumeAttachment;
    };
    sdk: {
      input: DetachVolumeCommandInput;
      output: DetachVolumeCommandOutput;
    };
  };
}
