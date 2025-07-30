import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyDBInstanceMessage,
  ModifyDBInstanceResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBInstanceCommandInput extends ModifyDBInstanceMessage {}
export interface ModifyDBInstanceCommandOutput
  extends ModifyDBInstanceResult,
    __MetadataBearer {}
declare const ModifyDBInstanceCommand_base: {
  new (
    input: ModifyDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBInstanceCommandInput,
    ModifyDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBInstanceCommandInput,
    ModifyDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBInstanceCommand extends ModifyDBInstanceCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBInstanceMessage;
      output: ModifyDBInstanceResult;
    };
    sdk: {
      input: ModifyDBInstanceCommandInput;
      output: ModifyDBInstanceCommandOutput;
    };
  };
}
