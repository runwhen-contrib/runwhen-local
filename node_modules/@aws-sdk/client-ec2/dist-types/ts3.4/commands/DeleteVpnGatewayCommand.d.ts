import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteVpnGatewayRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVpnGatewayCommandInput extends DeleteVpnGatewayRequest {}
export interface DeleteVpnGatewayCommandOutput extends __MetadataBearer {}
declare const DeleteVpnGatewayCommand_base: {
  new (
    input: DeleteVpnGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpnGatewayCommandInput,
    DeleteVpnGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVpnGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpnGatewayCommandInput,
    DeleteVpnGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVpnGatewayCommand extends DeleteVpnGatewayCommand_base {
  protected static __types: {
    api: {
      input: DeleteVpnGatewayRequest;
      output: {};
    };
    sdk: {
      input: DeleteVpnGatewayCommandInput;
      output: DeleteVpnGatewayCommandOutput;
    };
  };
}
