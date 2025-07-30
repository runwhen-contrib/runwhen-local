import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteDBInstanceMessage,
  DeleteDBInstanceResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteDBInstanceCommandInput extends DeleteDBInstanceMessage {}
export interface DeleteDBInstanceCommandOutput
  extends DeleteDBInstanceResult,
    __MetadataBearer {}
declare const DeleteDBInstanceCommand_base: {
  new (
    input: DeleteDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBInstanceCommandInput,
    DeleteDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteDBInstanceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteDBInstanceCommandInput,
    DeleteDBInstanceCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteDBInstanceCommand extends DeleteDBInstanceCommand_base {
  protected static __types: {
    api: {
      input: DeleteDBInstanceMessage;
      output: DeleteDBInstanceResult;
    };
    sdk: {
      input: DeleteDBInstanceCommandInput;
      output: DeleteDBInstanceCommandOutput;
    };
  };
}
