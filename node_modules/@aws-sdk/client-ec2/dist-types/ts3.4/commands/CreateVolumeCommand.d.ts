import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CreateVolumeRequest, Volume } from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateVolumeCommandInput extends CreateVolumeRequest {}
export interface CreateVolumeCommandOutput extends Volume, __MetadataBearer {}
declare const CreateVolumeCommand_base: {
  new (
    input: CreateVolumeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVolumeCommandInput,
    CreateVolumeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateVolumeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateVolumeCommandInput,
    CreateVolumeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateVolumeCommand extends CreateVolumeCommand_base {
  protected static __types: {
    api: {
      input: CreateVolumeRequest;
      output: Volume;
    };
    sdk: {
      input: CreateVolumeCommandInput;
      output: CreateVolumeCommandOutput;
    };
  };
}
