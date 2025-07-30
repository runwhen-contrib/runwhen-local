import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ExportTransitGatewayRoutesRequest,
  ExportTransitGatewayRoutesResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface ExportTransitGatewayRoutesCommandInput
  extends ExportTransitGatewayRoutesRequest {}
export interface ExportTransitGatewayRoutesCommandOutput
  extends ExportTransitGatewayRoutesResult,
    __MetadataBearer {}
declare const ExportTransitGatewayRoutesCommand_base: {
  new (
    input: ExportTransitGatewayRoutesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ExportTransitGatewayRoutesCommandInput,
    ExportTransitGatewayRoutesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ExportTransitGatewayRoutesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ExportTransitGatewayRoutesCommandInput,
    ExportTransitGatewayRoutesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ExportTransitGatewayRoutesCommand extends ExportTransitGatewayRoutesCommand_base {
  protected static __types: {
    api: {
      input: ExportTransitGatewayRoutesRequest;
      output: ExportTransitGatewayRoutesResult;
    };
    sdk: {
      input: ExportTransitGatewayRoutesCommandInput;
      output: ExportTransitGatewayRoutesCommandOutput;
    };
  };
}
