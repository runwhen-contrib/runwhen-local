import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteVolumeRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVolumeCommandInput extends DeleteVolumeRequest {}
export interface DeleteVolumeCommandOutput extends __MetadataBearer {}
declare const DeleteVolumeCommand_base: {
  new (
    input: DeleteVolumeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVolumeCommandInput,
    DeleteVolumeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVolumeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVolumeCommandInput,
    DeleteVolumeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVolumeCommand extends DeleteVolumeCommand_base {
  protected static __types: {
    api: {
      input: DeleteVolumeRequest;
      output: {};
    };
    sdk: {
      input: DeleteVolumeCommandInput;
      output: DeleteVolumeCommandOutput;
    };
  };
}
