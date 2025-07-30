import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { RemoveRoleFromDBClusterMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RemoveRoleFromDBClusterCommandInput
  extends RemoveRoleFromDBClusterMessage {}
export interface RemoveRoleFromDBClusterCommandOutput
  extends __MetadataBearer {}
declare const RemoveRoleFromDBClusterCommand_base: {
  new (
    input: RemoveRoleFromDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RemoveRoleFromDBClusterCommandInput,
    RemoveRoleFromDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RemoveRoleFromDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RemoveRoleFromDBClusterCommandInput,
    RemoveRoleFromDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RemoveRoleFromDBClusterCommand extends RemoveRoleFromDBClusterCommand_base {
  protected static __types: {
    api: {
      input: RemoveRoleFromDBClusterMessage;
      output: {};
    };
    sdk: {
      input: RemoveRoleFromDBClusterCommandInput;
      output: RemoveRoleFromDBClusterCommandOutput;
    };
  };
}
