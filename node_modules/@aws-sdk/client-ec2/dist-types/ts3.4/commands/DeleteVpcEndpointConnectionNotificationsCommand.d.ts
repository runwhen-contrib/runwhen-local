import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteVpcEndpointConnectionNotificationsRequest,
  DeleteVpcEndpointConnectionNotificationsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVpcEndpointConnectionNotificationsCommandInput
  extends DeleteVpcEndpointConnectionNotificationsRequest {}
export interface DeleteVpcEndpointConnectionNotificationsCommandOutput
  extends DeleteVpcEndpointConnectionNotificationsResult,
    __MetadataBearer {}
declare const DeleteVpcEndpointConnectionNotificationsCommand_base: {
  new (
    input: DeleteVpcEndpointConnectionNotificationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcEndpointConnectionNotificationsCommandInput,
    DeleteVpcEndpointConnectionNotificationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVpcEndpointConnectionNotificationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcEndpointConnectionNotificationsCommandInput,
    DeleteVpcEndpointConnectionNotificationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVpcEndpointConnectionNotificationsCommand extends DeleteVpcEndpointConnectionNotificationsCommand_base {
  protected static __types: {
    api: {
      input: DeleteVpcEndpointConnectionNotificationsRequest;
      output: DeleteVpcEndpointConnectionNotificationsResult;
    };
    sdk: {
      input: DeleteVpcEndpointConnectionNotificationsCommandInput;
      output: DeleteVpcEndpointConnectionNotificationsCommandOutput;
    };
  };
}
