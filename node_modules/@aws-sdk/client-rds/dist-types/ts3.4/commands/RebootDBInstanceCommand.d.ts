import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  RebootDBInstanceMessage,
  RebootDBInstanceResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RebootDBInstanceCommandInput extends RebootDBInstanceMessage {}
export interface RebootDBInstanceCommandOutput
  extends RebootDBInstanceResult,
    __MetadataBearer {}
declare const RebootDBInstanceCommand_base: {
  new (
    input: RebootDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RebootDBInstanceCommandInput,
    RebootDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RebootDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RebootDBInstanceCommandInput,
    RebootDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RebootDBInstanceCommand extends RebootDBInstanceCommand_base {
  protected static __types: {
    api: {
      input: RebootDBInstanceMessage;
      output: RebootDBInstanceResult;
    };
    sdk: {
      input: RebootDBInstanceCommandInput;
      output: RebootDBInstanceCommandOutput;
    };
  };
}
