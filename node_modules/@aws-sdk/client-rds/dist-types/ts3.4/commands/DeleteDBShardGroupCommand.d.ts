import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DBShardGroup, DeleteDBShardGroupMessage } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBShardGroupCommandInput
  extends DeleteDBShardGroupMessage {}
export interface DeleteDBShardGroupCommandOutput
  extends DBShardGroup,
    __MetadataBearer {}
declare const DeleteDBShardGroupCommand_base: {
  new (
    input: DeleteDBShardGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBShardGroupCommandInput,
    DeleteDBShardGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBShardGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBShardGroupCommandInput,
    DeleteDBShardGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBShardGroupCommand extends DeleteDBShardGroupCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBShardGroupMessage;
      output: DBShardGroup;
    };
    sdk: {
      input: DeleteDBShardGroupCommandInput;
      output: DeleteDBShardGroupCommandOutput;
    };
  };
}
