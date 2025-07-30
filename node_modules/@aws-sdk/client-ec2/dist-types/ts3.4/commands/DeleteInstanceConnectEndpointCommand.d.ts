import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteInstanceConnectEndpointRequest,
  DeleteInstanceConnectEndpointResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteInstanceConnectEndpointCommandInput
  extends DeleteInstanceConnectEndpointRequest {}
export interface DeleteInstanceConnectEndpointCommandOutput
  extends DeleteInstanceConnectEndpointResult,
    __MetadataBearer {}
declare const DeleteInstanceConnectEndpointCommand_base: {
  new (
    input: DeleteInstanceConnectEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteInstanceConnectEndpointCommandInput,
    DeleteInstanceConnectEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteInstanceConnectEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteInstanceConnectEndpointCommandInput,
    DeleteInstanceConnectEndpointCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteInstanceConnectEndpointCommand extends DeleteInstanceConnectEndpointCommand_base {
  protected static __types: {
    api: {
      input: DeleteInstanceConnectEndpointRequest;
      output: DeleteInstanceConnectEndpointResult;
    };
    sdk: {
      input: DeleteInstanceConnectEndpointCommandInput;
      output: DeleteInstanceConnectEndpointCommandOutput;
    };
  };
}
