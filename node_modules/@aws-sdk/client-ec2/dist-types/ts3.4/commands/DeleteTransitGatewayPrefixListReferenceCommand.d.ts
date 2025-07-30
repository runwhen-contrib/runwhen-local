import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTransitGatewayPrefixListReferenceRequest,
  DeleteTransitGatewayPrefixListReferenceResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTransitGatewayPrefixListReferenceCommandInput
  extends DeleteTransitGatewayPrefixListReferenceRequest {}
export interface DeleteTransitGatewayPrefixListReferenceCommandOutput
  extends DeleteTransitGatewayPrefixListReferenceResult,
    __MetadataBearer {}
declare const DeleteTransitGatewayPrefixListReferenceCommand_base: {
  new (
    input: DeleteTransitGatewayPrefixListReferenceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayPrefixListReferenceCommandInput,
    DeleteTransitGatewayPrefixListReferenceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTransitGatewayPrefixListReferenceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayPrefixListReferenceCommandInput,
    DeleteTransitGatewayPrefixListReferenceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTransitGatewayPrefixListReferenceCommand extends DeleteTransitGatewayPrefixListReferenceCommand_base {
  protected static __types: {
    api: {
      input: DeleteTransitGatewayPrefixListReferenceRequest;
      output: DeleteTransitGatewayPrefixListReferenceResult;
    };
    sdk: {
      input: DeleteTransitGatewayPrefixListReferenceCommandInput;
      output: DeleteTransitGatewayPrefixListReferenceCommandOutput;
    };
  };
}
