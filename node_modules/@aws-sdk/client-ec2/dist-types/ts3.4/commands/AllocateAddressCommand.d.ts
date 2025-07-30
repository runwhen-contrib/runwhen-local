import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AllocateAddressRequest,
  AllocateAddressResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AllocateAddressCommandInput extends AllocateAddressRequest {}
export interface AllocateAddressCommandOutput
  extends AllocateAddressResult,
    __MetadataBearer {}
declare const AllocateAddressCommand_base: {
  new (
    input: AllocateAddressCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AllocateAddressCommandInput,
    AllocateAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [AllocateAddressCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    AllocateAddressCommandInput,
    AllocateAddressCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AllocateAddressCommand extends AllocateAddressCommand_base {
  protected static __types: {
    api: {
      input: AllocateAddressRequest;
      output: AllocateAddressResult;
    };
    sdk: {
      input: AllocateAddressCommandInput;
      output: AllocateAddressCommandOutput;
    };
  };
}
