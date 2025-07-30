import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationRequest,
  DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommandInput
  extends DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationRequest {}
export interface DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommandOutput
  extends DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationResult,
    __MetadataBearer {}
declare const DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommand_base: {
  new (
    input: DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommandInput,
    DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommandInput,
    DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommand extends DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommand_base {
  protected static __types: {
    api: {
      input: DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationRequest;
      output: DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationResult;
    };
    sdk: {
      input: DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommandInput;
      output: DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationCommandOutput;
    };
  };
}
