import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyDBSubnetGroupMessage,
  ModifyDBSubnetGroupResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyDBSubnetGroupCommandInput
  extends ModifyDBSubnetGroupMessage {}
export interface ModifyDBSubnetGroupCommandOutput
  extends ModifyDBSubnetGroupResult,
    __MetadataBearer {}
declare const ModifyDBSubnetGroupCommand_base: {
  new (
    input: ModifyDBSubnetGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBSubnetGroupCommandInput,
    ModifyDBSubnetGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyDBSubnetGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyDBSubnetGroupCommandInput,
    ModifyDBSubnetGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyDBSubnetGroupCommand extends ModifyDBSubnetGroupCommand_base {
  protected static __types: {
    api: {
      input: ModifyDBSubnetGroupMessage;
      output: ModifyDBSubnetGroupResult;
    };
    sdk: {
      input: ModifyDBSubnetGroupCommandInput;
      output: ModifyDBSubnetGroupCommandOutput;
    };
  };
}
