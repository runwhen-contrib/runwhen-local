import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteTransitGatewayPolicyTableRequest,
  DeleteTransitGatewayPolicyTableResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteTransitGatewayPolicyTableCommandInput
  extends DeleteTransitGatewayPolicyTableRequest {}
export interface DeleteTransitGatewayPolicyTableCommandOutput
  extends DeleteTransitGatewayPolicyTableResult,
    __MetadataBearer {}
declare const DeleteTransitGatewayPolicyTableCommand_base: {
  new (
    input: DeleteTransitGatewayPolicyTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayPolicyTableCommandInput,
    DeleteTransitGatewayPolicyTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTransitGatewayPolicyTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTransitGatewayPolicyTableCommandInput,
    DeleteTransitGatewayPolicyTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTransitGatewayPolicyTableCommand extends DeleteTransitGatewayPolicyTableCommand_base {
  protected static __types: {
    api: {
      input: DeleteTransitGatewayPolicyTableRequest;
      output: DeleteTransitGatewayPolicyTableResult;
    };
    sdk: {
      input: DeleteTransitGatewayPolicyTableCommandInput;
      output: DeleteTransitGatewayPolicyTableCommandOutput;
    };
  };
}
