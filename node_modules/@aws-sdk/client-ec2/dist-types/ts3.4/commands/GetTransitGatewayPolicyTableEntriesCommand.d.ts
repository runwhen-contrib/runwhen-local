import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetTransitGatewayPolicyTableEntriesRequest,
  GetTransitGatewayPolicyTableEntriesResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetTransitGatewayPolicyTableEntriesCommandInput
  extends GetTransitGatewayPolicyTableEntriesRequest {}
export interface GetTransitGatewayPolicyTableEntriesCommandOutput
  extends GetTransitGatewayPolicyTableEntriesResult,
    __MetadataBearer {}
declare const GetTransitGatewayPolicyTableEntriesCommand_base: {
  new (
    input: GetTransitGatewayPolicyTableEntriesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayPolicyTableEntriesCommandInput,
    GetTransitGatewayPolicyTableEntriesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetTransitGatewayPolicyTableEntriesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetTransitGatewayPolicyTableEntriesCommandInput,
    GetTransitGatewayPolicyTableEntriesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetTransitGatewayPolicyTableEntriesCommand extends GetTransitGatewayPolicyTableEntriesCommand_base {
  protected static __types: {
    api: {
      input: GetTransitGatewayPolicyTableEntriesRequest;
      output: GetTransitGatewayPolicyTableEntriesResult;
    };
    sdk: {
      input: GetTransitGatewayPolicyTableEntriesCommandInput;
      output: GetTransitGatewayPolicyTableEntriesCommandOutput;
    };
  };
}
