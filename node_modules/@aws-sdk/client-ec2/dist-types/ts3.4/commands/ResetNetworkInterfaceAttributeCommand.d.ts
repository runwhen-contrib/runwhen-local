import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ResetNetworkInterfaceAttributeRequest } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ResetNetworkInterfaceAttributeCommandInput
  extends ResetNetworkInterfaceAttributeRequest {}
export interface ResetNetworkInterfaceAttributeCommandOutput
  extends __MetadataBearer {}
declare const ResetNetworkInterfaceAttributeCommand_base: {
  new (
    input: ResetNetworkInterfaceAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetNetworkInterfaceAttributeCommandInput,
    ResetNetworkInterfaceAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ResetNetworkInterfaceAttributeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ResetNetworkInterfaceAttributeCommandInput,
    ResetNetworkInterfaceAttributeCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ResetNetworkInterfaceAttributeCommand extends ResetNetworkInterfaceAttributeCommand_base {
  protected static __types: {
    api: {
      input: ResetNetworkInterfaceAttributeRequest;
      output: {};
    };
    sdk: {
      input: ResetNetworkInterfaceAttributeCommandInput;
      output: ResetNetworkInterfaceAttributeCommandOutput;
    };
  };
}
