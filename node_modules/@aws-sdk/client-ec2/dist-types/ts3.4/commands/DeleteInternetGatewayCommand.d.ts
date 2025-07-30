import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteInternetGatewayRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteInternetGatewayCommandInput
  extends DeleteInternetGatewayRequest {}
export interface DeleteInternetGatewayCommandOutput extends __MetadataBearer {}
declare const DeleteInternetGatewayCommand_base: {
  new (
    input: DeleteInternetGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteInternetGatewayCommandInput,
    DeleteInternetGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteInternetGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteInternetGatewayCommandInput,
    DeleteInternetGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteInternetGatewayCommand extends DeleteInternetGatewayCommand_base {
  protected static __types: {
    api: {
      input: DeleteInternetGatewayRequest;
      output: {};
    };
    sdk: {
      input: DeleteInternetGatewayCommandInput;
      output: DeleteInternetGatewayCommandOutput;
    };
  };
}
