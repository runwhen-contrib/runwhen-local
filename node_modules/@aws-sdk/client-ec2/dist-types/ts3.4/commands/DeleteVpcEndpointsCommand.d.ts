import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteVpcEndpointsRequest,
  DeleteVpcEndpointsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteVpcEndpointsCommandInput
  extends DeleteVpcEndpointsRequest {}
export interface DeleteVpcEndpointsCommandOutput
  extends DeleteVpcEndpointsResult,
    __MetadataBearer {}
declare const DeleteVpcEndpointsCommand_base: {
  new (
    input: DeleteVpcEndpointsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcEndpointsCommandInput,
    DeleteVpcEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteVpcEndpointsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteVpcEndpointsCommandInput,
    DeleteVpcEndpointsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteVpcEndpointsCommand extends DeleteVpcEndpointsCommand_base {
  protected static __types: {
    api: {
      input: DeleteVpcEndpointsRequest;
      output: DeleteVpcEndpointsResult;
    };
    sdk: {
      input: DeleteVpcEndpointsCommandInput;
      output: DeleteVpcEndpointsCommandOutput;
    };
  };
}
