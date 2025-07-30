import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  StartDBInstanceMessage,
  StartDBInstanceResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface StartDBInstanceCommandInput extends StartDBInstanceMessage {}
export interface StartDBInstanceCommandOutput
  extends StartDBInstanceResult,
    __MetadataBearer {}
declare const StartDBInstanceCommand_base: {
  new (
    input: StartDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StartDBInstanceCommandInput,
    StartDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: StartDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    StartDBInstanceCommandInput,
    StartDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class StartDBInstanceCommand extends StartDBInstanceCommand_base {
  protected static __types: {
    api: {
      input: StartDBInstanceMessage;
      output: StartDBInstanceResult;
    };
    sdk: {
      input: StartDBInstanceCommandInput;
      output: StartDBInstanceCommandOutput;
    };
  };
}
