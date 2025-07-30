import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  StopDBInstanceMessage,
  StopDBInstanceResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface StopDBInstanceCommandInput extends StopDBInstanceMessage {}
export interface StopDBInstanceCommandOutput
  extends StopDBInstanceResult,
    __MetadataBearer {}
declare const StopDBInstanceCommand_base: {
  new (
    input: StopDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StopDBInstanceCommandInput,
    StopDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: StopDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StopDBInstanceCommandInput,
    StopDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class StopDBInstanceCommand extends StopDBInstanceCommand_base {
  protected static __types: {
    api: {
      input: StopDBInstanceMessage;
      output: StopDBInstanceResult;
    };
    sdk: {
      input: StopDBInstanceCommandInput;
      output: StopDBInstanceCommandOutput;
    };
  };
}
