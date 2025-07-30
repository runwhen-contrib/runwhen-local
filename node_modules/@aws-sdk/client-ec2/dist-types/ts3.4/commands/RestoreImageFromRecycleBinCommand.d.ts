import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RestoreImageFromRecycleBinRequest,
  RestoreImageFromRecycleBinResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RestoreImageFromRecycleBinCommandInput
  extends RestoreImageFromRecycleBinRequest {}
export interface RestoreImageFromRecycleBinCommandOutput
  extends RestoreImageFromRecycleBinResult,
    __MetadataBearer {}
declare const RestoreImageFromRecycleBinCommand_base: {
  new (
    input: RestoreImageFromRecycleBinCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreImageFromRecycleBinCommandInput,
    RestoreImageFromRecycleBinCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RestoreImageFromRecycleBinCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreImageFromRecycleBinCommandInput,
    RestoreImageFromRecycleBinCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RestoreImageFromRecycleBinCommand extends RestoreImageFromRecycleBinCommand_base {
  protected static __types: {
    api: {
      input: RestoreImageFromRecycleBinRequest;
      output: RestoreImageFromRecycleBinResult;
    };
    sdk: {
      input: RestoreImageFromRecycleBinCommandInput;
      output: RestoreImageFromRecycleBinCommandOutput;
    };
  };
}
