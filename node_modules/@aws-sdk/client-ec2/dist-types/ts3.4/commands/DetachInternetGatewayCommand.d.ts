import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DetachInternetGatewayRequest } from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DetachInternetGatewayCommandInput
  extends DetachInternetGatewayRequest {}
export interface DetachInternetGatewayCommandOutput extends __MetadataBearer {}
declare const DetachInternetGatewayCommand_base: {
  new (
    input: DetachInternetGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachInternetGatewayCommandInput,
    DetachInternetGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DetachInternetGatewayCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DetachInternetGatewayCommandInput,
    DetachInternetGatewayCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DetachInternetGatewayCommand extends DetachInternetGatewayCommand_base {
  protected static __types: {
    api: {
      input: DetachInternetGatewayRequest;
      output: {};
    };
    sdk: {
      input: DetachInternetGatewayCommandInput;
      output: DetachInternetGatewayCommandOutput;
    };
  };
}
