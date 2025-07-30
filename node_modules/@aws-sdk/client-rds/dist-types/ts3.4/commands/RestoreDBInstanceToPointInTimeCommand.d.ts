import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RestoreDBInstanceToPointInTimeMessage,
  RestoreDBInstanceToPointInTimeResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RestoreDBInstanceToPointInTimeCommandInput
  extends RestoreDBInstanceToPointInTimeMessage {}
export interface RestoreDBInstanceToPointInTimeCommandOutput
  extends RestoreDBInstanceToPointInTimeResult,
    __MetadataBearer {}
declare const RestoreDBInstanceToPointInTimeCommand_base: {
  new (
    input: RestoreDBInstanceToPointInTimeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBInstanceToPointInTimeCommandInput,
    RestoreDBInstanceToPointInTimeCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RestoreDBInstanceToPointInTimeCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RestoreDBInstanceToPointInTimeCommandInput,
    RestoreDBInstanceToPointInTimeCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RestoreDBInstanceToPointInTimeCommand extends RestoreDBInstanceToPointInTimeCommand_base {
  protected static __types: {
    api: {
      input: RestoreDBInstanceToPointInTimeMessage;
      output: RestoreDBInstanceToPointInTimeResult;
    };
    sdk: {
      input: RestoreDBInstanceToPointInTimeCommandInput;
      output: RestoreDBInstanceToPointInTimeCommandOutput;
    };
  };
}
