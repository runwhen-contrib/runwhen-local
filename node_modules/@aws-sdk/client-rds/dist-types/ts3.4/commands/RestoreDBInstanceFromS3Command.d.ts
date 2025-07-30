import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RestoreDBInstanceFromS3Message,
  RestoreDBInstanceFromS3Result,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RestoreDBInstanceFromS3CommandInput
  extends RestoreDBInstanceFromS3Message {}
export interface RestoreDBInstanceFromS3CommandOutput
  extends RestoreDBInstanceFromS3Result,
    __MetadataBearer {}
declare const RestoreDBInstanceFromS3Command_base: {
  new (
    input: RestoreDBInstanceFromS3CommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBInstanceFromS3CommandInput,
    RestoreDBInstanceFromS3CommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RestoreDBInstanceFromS3CommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBInstanceFromS3CommandInput,
    RestoreDBInstanceFromS3CommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RestoreDBInstanceFromS3Command extends RestoreDBInstanceFromS3Command_base {
  protected static __types: {
    api: {
      input: RestoreDBInstanceFromS3Message;
      output: RestoreDBInstanceFromS3Result;
    };
    sdk: {
      input: RestoreDBInstanceFromS3CommandInput;
      output: RestoreDBInstanceFromS3CommandOutput;
    };
  };
}
