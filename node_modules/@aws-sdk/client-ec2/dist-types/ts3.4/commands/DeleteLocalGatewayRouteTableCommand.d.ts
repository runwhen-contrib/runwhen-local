import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteLocalGatewayRouteTableRequest,
  DeleteLocalGatewayRouteTableResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteLocalGatewayRouteTableCommandInput
  extends DeleteLocalGatewayRouteTableRequest {}
export interface DeleteLocalGatewayRouteTableCommandOutput
  extends DeleteLocalGatewayRouteTableResult,
    __MetadataBearer {}
declare const DeleteLocalGatewayRouteTableCommand_base: {
  new (
    input: DeleteLocalGatewayRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLocalGatewayRouteTableCommandInput,
    DeleteLocalGatewayRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteLocalGatewayRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLocalGatewayRouteTableCommandInput,
    DeleteLocalGatewayRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteLocalGatewayRouteTableCommand extends DeleteLocalGatewayRouteTableCommand_base {
  protected static __types: {
    api: {
      input: DeleteLocalGatewayRouteTableRequest;
      output: DeleteLocalGatewayRouteTableResult;
    };
    sdk: {
      input: DeleteLocalGatewayRouteTableCommandInput;
      output: DeleteLocalGatewayRouteTableCommandOutput;
    };
  };
}
