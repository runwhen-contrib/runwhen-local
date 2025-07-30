import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteVpcEndpointServiceConfigurationsRequest,
  DeleteVpcEndpointServiceConfigurationsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVpcEndpointServiceConfigurationsCommandInput
  extends DeleteVpcEndpointServiceConfigurationsRequest {}
export interface DeleteVpcEndpointServiceConfigurationsCommandOutput
  extends DeleteVpcEndpointServiceConfigurationsResult,
    __MetadataBearer {}
declare const DeleteVpcEndpointServiceConfigurationsCommand_base: {
  new (
    input: DeleteVpcEndpointServiceConfigurationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcEndpointServiceConfigurationsCommandInput,
    DeleteVpcEndpointServiceConfigurationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVpcEndpointServiceConfigurationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcEndpointServiceConfigurationsCommandInput,
    DeleteVpcEndpointServiceConfigurationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVpcEndpointServiceConfigurationsCommand extends DeleteVpcEndpointServiceConfigurationsCommand_base {
  protected static __types: {
    api: {
      input: DeleteVpcEndpointServiceConfigurationsRequest;
      output: DeleteVpcEndpointServiceConfigurationsResult;
    };
    sdk: {
      input: DeleteVpcEndpointServiceConfigurationsCommandInput;
      output: DeleteVpcEndpointServiceConfigurationsCommandOutput;
    };
  };
}
