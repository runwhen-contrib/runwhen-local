import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { EnableVolumeIORequest } from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface EnableVolumeIOCommandInput extends EnableVolumeIORequest {}
export interface EnableVolumeIOCommandOutput extends __MetadataBearer {}
declare const EnableVolumeIOCommand_base: {
  new (
    input: EnableVolumeIOCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableVolumeIOCommandInput,
    EnableVolumeIOCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: EnableVolumeIOCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    EnableVolumeIOCommandInput,
    EnableVolumeIOCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class EnableVolumeIOCommand extends EnableVolumeIOCommand_base {
  protected static __types: {
    api: {
      input: EnableVolumeIORequest;
      output: {};
    };
    sdk: {
      input: EnableVolumeIOCommandInput;
      output: EnableVolumeIOCommandOutput;
    };
  };
}
