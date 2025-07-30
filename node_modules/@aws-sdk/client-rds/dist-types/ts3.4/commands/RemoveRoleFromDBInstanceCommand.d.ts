import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { RemoveRoleFromDBInstanceMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface RemoveRoleFromDBInstanceCommandInput
  extends RemoveRoleFromDBInstanceMessage {}
export interface RemoveRoleFromDBInstanceCommandOutput
  extends __MetadataBearer {}
declare const RemoveRoleFromDBInstanceCommand_base: {
  new (
    input: RemoveRoleFromDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RemoveRoleFromDBInstanceCommandInput,
    RemoveRoleFromDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RemoveRoleFromDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RemoveRoleFromDBInstanceCommandInput,
    RemoveRoleFromDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RemoveRoleFromDBInstanceCommand extends RemoveRoleFromDBInstanceCommand_base {
  protected static __types: {
    api: {
      input: RemoveRoleFromDBInstanceMessage;
      output: {};
    };
    sdk: {
      input: RemoveRoleFromDBInstanceCommandInput;
      output: RemoveRoleFromDBInstanceCommandOutput;
    };
  };
}
