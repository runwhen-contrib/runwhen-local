import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { AttachInternetGatewayRequest } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AttachInternetGatewayCommandInput
  extends AttachInternetGatewayRequest {}
export interface AttachInternetGatewayCommandOutput extends __MetadataBearer {}
declare const AttachInternetGatewayCommand_base: {
  new (
    input: AttachInternetGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachInternetGatewayCommandInput,
    AttachInternetGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AttachInternetGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AttachInternetGatewayCommandInput,
    AttachInternetGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AttachInternetGatewayCommand extends AttachInternetGatewayCommand_base {
  protected static __types: {
    api: {
      input: AttachInternetGatewayRequest;
      output: {};
    };
    sdk: {
      input: AttachInternetGatewayCommandInput;
      output: AttachInternetGatewayCommandOutput;
    };
  };
}
