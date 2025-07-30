import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  StartDBClusterMessage,
  StartDBClusterResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface StartDBClusterCommandInput extends StartDBClusterMessage {}
export interface StartDBClusterCommandOutput
  extends StartDBClusterResult,
    __MetadataBearer {}
declare const StartDBClusterCommand_base: {
  new (
    input: StartDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StartDBClusterCommandInput,
    StartDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: StartDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StartDBClusterCommandInput,
    StartDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class StartDBClusterCommand extends StartDBClusterCommand_base {
  protected static __types: {
    api: {
      input: StartDBClusterMessage;
      output: StartDBClusterResult;
    };
    sdk: {
      input: StartDBClusterCommandInput;
      output: StartDBClusterCommandOutput;
    };
  };
}
