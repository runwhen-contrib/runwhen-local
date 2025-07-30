import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteLocalGatewayRouteTableVpcAssociationRequest,
  DeleteLocalGatewayRouteTableVpcAssociationResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteLocalGatewayRouteTableVpcAssociationCommandInput
  extends DeleteLocalGatewayRouteTableVpcAssociationRequest {}
export interface DeleteLocalGatewayRouteTableVpcAssociationCommandOutput
  extends DeleteLocalGatewayRouteTableVpcAssociationResult,
    __MetadataBearer {}
declare const DeleteLocalGatewayRouteTableVpcAssociationCommand_base: {
  new (
    input: DeleteLocalGatewayRouteTableVpcAssociationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLocalGatewayRouteTableVpcAssociationCommandInput,
    DeleteLocalGatewayRouteTableVpcAssociationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteLocalGatewayRouteTableVpcAssociationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLocalGatewayRouteTableVpcAssociationCommandInput,
    DeleteLocalGatewayRouteTableVpcAssociationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteLocalGatewayRouteTableVpcAssociationCommand extends DeleteLocalGatewayRouteTableVpcAssociationCommand_base {
  protected static __types: {
    api: {
      input: DeleteLocalGatewayRouteTableVpcAssociationRequest;
      output: DeleteLocalGatewayRouteTableVpcAssociationResult;
    };
    sdk: {
      input: DeleteLocalGatewayRouteTableVpcAssociationCommandInput;
      output: DeleteLocalGatewayRouteTableVpcAssociationCommandOutput;
    };
  };
}
