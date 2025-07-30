import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { StopDBClusterMessage, StopDBClusterResult } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface StopDBClusterCommandInput extends StopDBClusterMessage {}
export interface StopDBClusterCommandOutput
  extends StopDBClusterResult,
    __MetadataBearer {}
declare const StopDBClusterCommand_base: {
  new (
    input: StopDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StopDBClusterCommandInput,
    StopDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: StopDBClusterCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StopDBClusterCommandInput,
    StopDBClusterCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class StopDBClusterCommand extends StopDBClusterCommand_base {
  protected static __types: {
    api: {
      input: StopDBClusterMessage;
      output: StopDBClusterResult;
    };
    sdk: {
      input: StopDBClusterCommandInput;
      output: StopDBClusterCommandOutput;
    };
  };
}
