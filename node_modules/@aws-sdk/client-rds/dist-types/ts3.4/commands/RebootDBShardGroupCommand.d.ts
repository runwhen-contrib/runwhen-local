import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DBShardGroup } from "../models/models_0";
import { RebootDBShardGroupMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RebootDBShardGroupCommandInput
  extends RebootDBShardGroupMessage {}
export interface RebootDBShardGroupCommandOutput
  extends DBShardGroup,
    __MetadataBearer {}
declare const RebootDBShardGroupCommand_base: {
  new (
    input: RebootDBShardGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RebootDBShardGroupCommandInput,
    RebootDBShardGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RebootDBShardGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RebootDBShardGroupCommandInput,
    RebootDBShardGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RebootDBShardGroupCommand extends RebootDBShardGroupCommand_base {
  protected static __types: {
    api: {
      input: RebootDBShardGroupMessage;
      output: DBShardGroup;
    };
    sdk: {
      input: RebootDBShardGroupCommandInput;
      output: RebootDBShardGroupCommandOutput;
    };
  };
}
