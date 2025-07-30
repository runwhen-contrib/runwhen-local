import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateDBSubnetGroupMessage,
  CreateDBSubnetGroupResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateDBSubnetGroupCommandInput
  extends CreateDBSubnetGroupMessage {}
export interface CreateDBSubnetGroupCommandOutput
  extends CreateDBSubnetGroupResult,
    __MetadataBearer {}
declare const CreateDBSubnetGroupCommand_base: {
  new (
    input: CreateDBSubnetGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBSubnetGroupCommandInput,
    CreateDBSubnetGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDBSubnetGroupCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDBSubnetGroupCommandInput,
    CreateDBSubnetGroupCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDBSubnetGroupCommand extends CreateDBSubnetGroupCommand_base {
  protected static __types: {
    api: {
      input: CreateDBSubnetGroupMessage;
      output: CreateDBSubnetGroupResult;
    };
    sdk: {
      input: CreateDBSubnetGroupCommandInput;
      output: CreateDBSubnetGroupCommandOutput;
    };
  };
}
