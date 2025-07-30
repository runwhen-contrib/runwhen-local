import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DisableAddressTransferRequest,
  DisableAddressTransferResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DisableAddressTransferCommandInput
  extends DisableAddressTransferRequest {}
export interface DisableAddressTransferCommandOutput
  extends DisableAddressTransferResult,
    __MetadataBearer {}
declare const DisableAddressTransferCommand_base: {
  new (
    input: DisableAddressTransferCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableAddressTransferCommandInput,
    DisableAddressTransferCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DisableAddressTransferCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DisableAddressTransferCommandInput,
    DisableAddressTransferCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DisableAddressTransferCommand extends DisableAddressTransferCommand_base {
  protected static __types: {
    api: {
      input: DisableAddressTransferRequest;
      output: DisableAddressTransferResult;
    };
    sdk: {
      input: DisableAddressTransferCommandInput;
      output: DisableAddressTransferCommandOutput;
    };
  };
}
