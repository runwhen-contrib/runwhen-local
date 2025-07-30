import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DBShardGroup } from "../models/models_0";
import { ModifyDBShardGroupMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBShardGroupCommandInput
  extends ModifyDBShardGroupMessage {}
export interface ModifyDBShardGroupCommandOutput
  extends DBShardGroup,
    __MetadataBearer {}
declare const ModifyDBShardGroupCommand_base: {
  new (
    input: ModifyDBShardGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBShardGroupCommandInput,
    ModifyDBShardGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBShardGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBShardGroupCommandInput,
    ModifyDBShardGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBShardGroupCommand extends ModifyDBShardGroupCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBShardGroupMessage;
      output: DBShardGroup;
    };
    sdk: {
      input: ModifyDBShardGroupCommandInput;
      output: ModifyDBShardGroupCommandOutput;
    };
  };
}
