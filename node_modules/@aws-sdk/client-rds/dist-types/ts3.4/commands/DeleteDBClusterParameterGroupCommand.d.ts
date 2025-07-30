import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DeleteDBClusterParameterGroupMessage } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBClusterParameterGroupCommandInput
  extends DeleteDBClusterParameterGroupMessage {}
export interface DeleteDBClusterParameterGroupCommandOutput
  extends __MetadataBearer {}
declare const DeleteDBClusterParameterGroupCommand_base: {
  new (
    input: DeleteDBClusterParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBClusterParameterGroupCommandInput,
    DeleteDBClusterParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBClusterParameterGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBClusterParameterGroupCommandInput,
    DeleteDBClusterParameterGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBClusterParameterGroupCommand extends DeleteDBClusterParameterGroupCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBClusterParameterGroupMessage;
      output: {};
    };
    sdk: {
      input: DeleteDBClusterParameterGroupCommandInput;
      output: DeleteDBClusterParameterGroupCommandOutput;
    };
  };
}
