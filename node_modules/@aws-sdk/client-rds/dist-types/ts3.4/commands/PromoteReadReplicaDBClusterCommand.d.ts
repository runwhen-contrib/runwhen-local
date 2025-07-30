import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  PromoteReadReplicaDBClusterMessage,
  PromoteReadReplicaDBClusterResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface PromoteReadReplicaDBClusterCommandInput
  extends PromoteReadReplicaDBClusterMessage {}
export interface PromoteReadReplicaDBClusterCommandOutput
  extends PromoteReadReplicaDBClusterResult,
    __MetadataBearer {}
declare const PromoteReadReplicaDBClusterCommand_base: {
  new (
    input: PromoteReadReplicaDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PromoteReadReplicaDBClusterCommandInput,
    PromoteReadReplicaDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: PromoteReadReplicaDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    PromoteReadReplicaDBClusterCommandInput,
    PromoteReadReplicaDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class PromoteReadReplicaDBClusterCommand extends PromoteReadReplicaDBClusterCommand_base {
  protected static __types: {
    api: {
      input: PromoteReadReplicaDBClusterMessage;
      output: PromoteReadReplicaDBClusterResult;
    };
    sdk: {
      input: PromoteReadReplicaDBClusterCommandInput;
      output: PromoteReadReplicaDBClusterCommandOutput;
    };
  };
}
