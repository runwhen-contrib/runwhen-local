import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CreateTenantDatabaseMessage,
  CreateTenantDatabaseResult,
} from "../models/models_0";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface CreateTenantDatabaseCommandInput
  extends CreateTenantDatabaseMessage {}
export interface CreateTenantDatabaseCommandOutput
  extends CreateTenantDatabaseResult,
    __MetadataBearer {}
declare const CreateTenantDatabaseCommand_base: {
  new (
    input: CreateTenantDatabaseCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTenantDatabaseCommandInput,
    CreateTenantDatabaseCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateTenantDatabaseCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateTenantDatabaseCommandInput,
    CreateTenantDatabaseCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateTenantDatabaseCommand extends CreateTenantDatabaseCommand_base {
  protected static __types: {
    api: {
      input: CreateTenantDatabaseMessage;
      output: CreateTenantDatabaseResult;
    };
    sdk: {
      input: CreateTenantDatabaseCommandInput;
      output: CreateTenantDatabaseCommandOutput;
    };
  };
}
