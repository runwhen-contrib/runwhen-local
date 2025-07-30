import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ModifyTransitGatewayPrefixListReferenceRequest,
  ModifyTransitGatewayPrefixListReferenceResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ModifyTransitGatewayPrefixListReferenceCommandInput
  extends ModifyTransitGatewayPrefixListReferenceRequest {}
export interface ModifyTransitGatewayPrefixListReferenceCommandOutput
  extends ModifyTransitGatewayPrefixListReferenceResult,
    __MetadataBearer {}
declare const ModifyTransitGatewayPrefixListReferenceCommand_base: {
  new (
    input: ModifyTransitGatewayPrefixListReferenceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTransitGatewayPrefixListReferenceCommandInput,
    ModifyTransitGatewayPrefixListReferenceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyTransitGatewayPrefixListReferenceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTransitGatewayPrefixListReferenceCommandInput,
    ModifyTransitGatewayPrefixListReferenceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyTransitGatewayPrefixListReferenceCommand extends ModifyTransitGatewayPrefixListReferenceCommand_base {
  protected static __types: {
    api: {
      input: ModifyTransitGatewayPrefixListReferenceRequest;
      output: ModifyTransitGatewayPrefixListReferenceResult;
    };
    sdk: {
      input: ModifyTransitGatewayPrefixListReferenceCommandInput;
      output: ModifyTransitGatewayPrefixListReferenceCommandOutput;
    };
  };
}
