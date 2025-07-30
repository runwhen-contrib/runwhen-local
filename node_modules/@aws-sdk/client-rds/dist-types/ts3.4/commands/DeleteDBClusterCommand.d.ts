import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteDBClusterMessage,
  DeleteDBClusterResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBClusterCommandInput extends DeleteDBClusterMessage {}
export interface DeleteDBClusterCommandOutput
  extends DeleteDBClusterResult,
    __MetadataBearer {}
declare const DeleteDBClusterCommand_base: {
  new (
    input: DeleteDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBClusterCommandInput,
    DeleteDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBClusterCommandInput,
    DeleteDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBClusterCommand extends DeleteDBClusterCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBClusterMessage;
      output: DeleteDBClusterResult;
    };
    sdk: {
      input: DeleteDBClusterCommandInput;
      output: DeleteDBClusterCommandOutput;
    };
  };
}
