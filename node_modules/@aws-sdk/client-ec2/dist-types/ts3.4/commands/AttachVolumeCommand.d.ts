import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { AttachVolumeRequest, VolumeAttachment } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AttachVolumeCommandInput extends AttachVolumeRequest {}
export interface AttachVolumeCommandOutput
  extends VolumeAttachment,
    __MetadataBearer {}
declare const AttachVolumeCommand_base: {
  new (
    input: AttachVolumeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachVolumeCommandInput,
    AttachVolumeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AttachVolumeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachVolumeCommandInput,
    AttachVolumeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AttachVolumeCommand extends AttachVolumeCommand_base {
  protected static __types: {
    api: {
      input: AttachVolumeRequest;
      output: VolumeAttachment;
    };
    sdk: {
      input: AttachVolumeCommandInput;
      output: AttachVolumeCommandOutput;
    };
  };
}
