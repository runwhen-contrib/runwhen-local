import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssignPrivateIpAddressesRequest,
  AssignPrivateIpAddressesResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssignPrivateIpAddressesCommandInput
  extends AssignPrivateIpAddressesRequest {}
export interface AssignPrivateIpAddressesCommandOutput
  extends AssignPrivateIpAddressesResult,
    __MetadataBearer {}
declare const AssignPrivateIpAddressesCommand_base: {
  new (
    input: AssignPrivateIpAddressesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssignPrivateIpAddressesCommandInput,
    AssignPrivateIpAddressesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssignPrivateIpAddressesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssignPrivateIpAddressesCommandInput,
    AssignPrivateIpAddressesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssignPrivateIpAddressesCommand extends AssignPrivateIpAddressesCommand_base {
  protected static __types: {
    api: {
      input: AssignPrivateIpAddressesRequest;
      output: AssignPrivateIpAddressesResult;
    };
    sdk: {
      input: AssignPrivateIpAddressesCommandInput;
      output: AssignPrivateIpAddressesCommandOutput;
    };
  };
}
