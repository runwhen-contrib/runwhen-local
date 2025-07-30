import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  ModifyTenantDatabaseMessage,
  ModifyTenantDatabaseResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface ModifyTenantDatabaseCommandInput
  extends ModifyTenantDatabaseMessage {}
export interface ModifyTenantDatabaseCommandOutput
  extends ModifyTenantDatabaseResult,
    __MetadataBearer {}
declare const ModifyTenantDatabaseCommand_base: {
  new (
    input: ModifyTenantDatabaseCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTenantDatabaseCommandInput,
    ModifyTenantDatabaseCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ModifyTenantDatabaseCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ModifyTenantDatabaseCommandInput,
    ModifyTenantDatabaseCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ModifyTenantDatabaseCommand extends ModifyTenantDatabaseCommand_base {
  protected static __types: {
    api: {
      input: ModifyTenantDatabaseMessage;
      output: ModifyTenantDatabaseResult;
    };
    sdk: {
      input: ModifyTenantDatabaseCommandInput;
      output: ModifyTenantDatabaseCommandOutput;
    };
  };
}
