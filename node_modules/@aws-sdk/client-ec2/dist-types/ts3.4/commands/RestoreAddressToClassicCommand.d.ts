import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RestoreAddressToClassicRequest,
  RestoreAddressToClassicResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RestoreAddressToClassicCommandInput
  extends RestoreAddressToClassicRequest {}
export interface RestoreAddressToClassicCommandOutput
  extends RestoreAddressToClassicResult,
    __MetadataBearer {}
declare const RestoreAddressToClassicCommand_base: {
  new (
    input: RestoreAddressToClassicCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreAddressToClassicCommandInput,
    RestoreAddressToClassicCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RestoreAddressToClassicCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreAddressToClassicCommandInput,
    RestoreAddressToClassicCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RestoreAddressToClassicCommand extends RestoreAddressToClassicCommand_base {
  protected static __types: {
    api: {
      input: RestoreAddressToClassicRequest;
      output: RestoreAddressToClassicResult;
    };
    sdk: {
      input: RestoreAddressToClassicCommandInput;
      output: RestoreAddressToClassicCommandOutput;
    };
  };
}
