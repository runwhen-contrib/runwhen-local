import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteLocalGatewayRouteRequest,
  DeleteLocalGatewayRouteResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteLocalGatewayRouteCommandInput
  extends DeleteLocalGatewayRouteRequest {}
export interface DeleteLocalGatewayRouteCommandOutput
  extends DeleteLocalGatewayRouteResult,
    __MetadataBearer {}
declare const DeleteLocalGatewayRouteCommand_base: {
  new (
    input: DeleteLocalGatewayRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLocalGatewayRouteCommandInput,
    DeleteLocalGatewayRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteLocalGatewayRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLocalGatewayRouteCommandInput,
    DeleteLocalGatewayRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteLocalGatewayRouteCommand extends DeleteLocalGatewayRouteCommand_base {
  protected static __types: {
    api: {
      input: DeleteLocalGatewayRouteRequest;
      output: DeleteLocalGatewayRouteResult;
    };
    sdk: {
      input: DeleteLocalGatewayRouteCommandInput;
      output: DeleteLocalGatewayRouteCommandOutput;
    };
  };
}
