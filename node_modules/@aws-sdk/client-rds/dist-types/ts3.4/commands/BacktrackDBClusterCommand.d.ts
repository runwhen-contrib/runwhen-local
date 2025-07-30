import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  BacktrackDBClusterMessage,
  DBClusterBacktrack,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface BacktrackDBClusterCommandInput
  extends BacktrackDBClusterMessage {}
export interface BacktrackDBClusterCommandOutput
  extends DBClusterBacktrack,
    __MetadataBearer {}
declare const BacktrackDBClusterCommand_base: {
  new (
    input: BacktrackDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    BacktrackDBClusterCommandInput,
    BacktrackDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: BacktrackDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    BacktrackDBClusterCommandInput,
    BacktrackDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class BacktrackDBClusterCommand extends BacktrackDBClusterCommand_base {
  protected static __types: {
    api: {
      input: BacktrackDBClusterMessage;
      output: DBClusterBacktrack;
    };
    sdk: {
      input: BacktrackDBClusterCommandInput;
      output: BacktrackDBClusterCommandOutput;
    };
  };
}
