import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteGlobalClusterMessage,
  DeleteGlobalClusterResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteGlobalClusterCommandInput
  extends DeleteGlobalClusterMessage {}
export interface DeleteGlobalClusterCommandOutput
  extends DeleteGlobalClusterResult,
    __MetadataBearer {}
declare const DeleteGlobalClusterCommand_base: {
  new (
    input: DeleteGlobalClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteGlobalClusterCommandInput,
    DeleteGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteGlobalClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteGlobalClusterCommandInput,
    DeleteGlobalClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteGlobalClusterCommand extends DeleteGlobalClusterCommand_base {
  protected static __types: {
    api: {
      input: DeleteGlobalClusterMessage;
      output: DeleteGlobalClusterResult;
    };
    sdk: {
      input: DeleteGlobalClusterCommandInput;
      output: DeleteGlobalClusterCommandOutput;
    };
  };
}
