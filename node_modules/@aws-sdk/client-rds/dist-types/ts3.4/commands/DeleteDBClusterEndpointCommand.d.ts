import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBClusterEndpoint,
  DeleteDBClusterEndpointMessage,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBClusterEndpointCommandInput
  extends DeleteDBClusterEndpointMessage {}
export interface DeleteDBClusterEndpointCommandOutput
  extends DBClusterEndpoint,
    __MetadataBearer {}
declare const DeleteDBClusterEndpointCommand_base: {
  new (
    input: DeleteDBClusterEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBClusterEndpointCommandInput,
    DeleteDBClusterEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBClusterEndpointCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBClusterEndpointCommandInput,
    DeleteDBClusterEndpointCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBClusterEndpointCommand extends DeleteDBClusterEndpointCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBClusterEndpointMessage;
      output: DBClusterEndpoint;
    };
    sdk: {
      input: DeleteDBClusterEndpointCommandInput;
      output: DeleteDBClusterEndpointCommandOutput;
    };
  };
}
