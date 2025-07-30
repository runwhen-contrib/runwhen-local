import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ReleaseAddressRequest } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReleaseAddressCommandInput extends ReleaseAddressRequest {}
export interface ReleaseAddressCommandOutput extends __MetadataBearer {}
declare const ReleaseAddressCommand_base: {
  new (
    input: ReleaseAddressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReleaseAddressCommandInput,
    ReleaseAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [ReleaseAddressCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    ReleaseAddressCommandInput,
    ReleaseAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReleaseAddressCommand extends ReleaseAddressCommand_base {
  protected static __types: {
    api: {
      input: ReleaseAddressRequest;
      output: {};
    };
    sdk: {
      input: ReleaseAddressCommandInput;
      output: ReleaseAddressCommandOutput;
    };
  };
}
