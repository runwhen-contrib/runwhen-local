import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBClusterCapacityInfo,
  ModifyCurrentDBClusterCapacityMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyCurrentDBClusterCapacityCommandInput
  extends ModifyCurrentDBClusterCapacityMessage {}
export interface ModifyCurrentDBClusterCapacityCommandOutput
  extends DBClusterCapacityInfo,
    __MetadataBearer {}
declare const ModifyCurrentDBClusterCapacityCommand_base: {
  new (
    input: ModifyCurrentDBClusterCapacityCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyCurrentDBClusterCapacityCommandInput,
    ModifyCurrentDBClusterCapacityCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyCurrentDBClusterCapacityCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyCurrentDBClusterCapacityCommandInput,
    ModifyCurrentDBClusterCapacityCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyCurrentDBClusterCapacityCommand extends ModifyCurrentDBClusterCapacityCommand_base {
  protected static __types: {
    api: {
      input: ModifyCurrentDBClusterCapacityMessage;
      output: DBClusterCapacityInfo;
    };
    sdk: {
      input: ModifyCurrentDBClusterCapacityCommandInput;
      output: ModifyCurrentDBClusterCapacityCommandOutput;
    };
  };
}
