import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RestoreDBClusterToPointInTimeMessage,
  RestoreDBClusterToPointInTimeResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RestoreDBClusterToPointInTimeCommandInput
  extends RestoreDBClusterToPointInTimeMessage {}
export interface RestoreDBClusterToPointInTimeCommandOutput
  extends RestoreDBClusterToPointInTimeResult,
    __MetadataBearer {}
declare const RestoreDBClusterToPointInTimeCommand_base: {
  new (
    input: RestoreDBClusterToPointInTimeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBClusterToPointInTimeCommandInput,
    RestoreDBClusterToPointInTimeCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RestoreDBClusterToPointInTimeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBClusterToPointInTimeCommandInput,
    RestoreDBClusterToPointInTimeCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RestoreDBClusterToPointInTimeCommand extends RestoreDBClusterToPointInTimeCommand_base {
  protected static __types: {
    api: {
      input: RestoreDBClusterToPointInTimeMessage;
      output: RestoreDBClusterToPointInTimeResult;
    };
    sdk: {
      input: RestoreDBClusterToPointInTimeCommandInput;
      output: RestoreDBClusterToPointInTimeCommandOutput;
    };
  };
}
