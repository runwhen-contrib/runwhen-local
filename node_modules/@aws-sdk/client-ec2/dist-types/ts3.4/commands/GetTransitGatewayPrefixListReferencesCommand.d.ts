import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetTransitGatewayPrefixListReferencesRequest,
  GetTransitGatewayPrefixListReferencesResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetTransitGatewayPrefixListReferencesCommandInput
  extends GetTransitGatewayPrefixListReferencesRequest {}
export interface GetTransitGatewayPrefixListReferencesCommandOutput
  extends GetTransitGatewayPrefixListReferencesResult,
    __MetadataBearer {}
declare const GetTransitGatewayPrefixListReferencesCommand_base: {
  new (
    input: GetTransitGatewayPrefixListReferencesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayPrefixListReferencesCommandInput,
    GetTransitGatewayPrefixListReferencesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetTransitGatewayPrefixListReferencesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayPrefixListReferencesCommandInput,
    GetTransitGatewayPrefixListReferencesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetTransitGatewayPrefixListReferencesCommand extends GetTransitGatewayPrefixListReferencesCommand_base {
  protected static __types: {
    api: {
      input: GetTransitGatewayPrefixListReferencesRequest;
      output: GetTransitGatewayPrefixListReferencesResult;
    };
    sdk: {
      input: GetTransitGatewayPrefixListReferencesCommandInput;
      output: GetTransitGatewayPrefixListReferencesCommandOutput;
    };
  };
}
