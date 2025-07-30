import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RestoreDBClusterFromS3Message,
  RestoreDBClusterFromS3Result,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RestoreDBClusterFromS3CommandInput
  extends RestoreDBClusterFromS3Message {}
export interface RestoreDBClusterFromS3CommandOutput
  extends RestoreDBClusterFromS3Result,
    __MetadataBearer {}
declare const RestoreDBClusterFromS3Command_base: {
  new (
    input: RestoreDBClusterFromS3CommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBClusterFromS3CommandInput,
    RestoreDBClusterFromS3CommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RestoreDBClusterFromS3CommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBClusterFromS3CommandInput,
    RestoreDBClusterFromS3CommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RestoreDBClusterFromS3Command extends RestoreDBClusterFromS3Command_base {
  protected static __types: {
    api: {
      input: RestoreDBClusterFromS3Message;
      output: RestoreDBClusterFromS3Result;
    };
    sdk: {
      input: RestoreDBClusterFromS3CommandInput;
      output: RestoreDBClusterFromS3CommandOutput;
    };
  };
}
