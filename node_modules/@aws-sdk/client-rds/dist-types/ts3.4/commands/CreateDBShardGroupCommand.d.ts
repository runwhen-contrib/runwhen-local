import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { CreateDBShardGroupMessage, DBShardGroup } from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBShardGroupCommandInput
  extends CreateDBShardGroupMessage {}
export interface CreateDBShardGroupCommandOutput
  extends DBShardGroup,
    __MetadataBearer {}
declare const CreateDBShardGroupCommand_base: {
  new (
    input: CreateDBShardGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBShardGroupCommandInput,
    CreateDBShardGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBShardGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBShardGroupCommandInput,
    CreateDBShardGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBShardGroupCommand extends CreateDBShardGroupCommand_base {
  protected static __types: {
    api: {
      input: CreateDBShardGroupMessage;
      output: DBShardGroup;
    };
    sdk: {
      input: CreateDBShardGroupCommandInput;
      output: CreateDBShardGroupCommandOutput;
    };
  };
}
