import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DeleteTenantDatabaseMessage,
  DeleteTenantDatabaseResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DeleteTenantDatabaseCommandInput
  extends DeleteTenantDatabaseMessage {}
export interface DeleteTenantDatabaseCommandOutput
  extends DeleteTenantDatabaseResult,
    __MetadataBearer {}
declare const DeleteTenantDatabaseCommand_base: {
  new (
    input: DeleteTenantDatabaseCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTenantDatabaseCommandInput,
    DeleteTenantDatabaseCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteTenantDatabaseCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteTenantDatabaseCommandInput,
    DeleteTenantDatabaseCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteTenantDatabaseCommand extends DeleteTenantDatabaseCommand_base {
  protected static __types: {
    api: {
      input: DeleteTenantDatabaseMessage;
      output: DeleteTenantDatabaseResult;
    };
    sdk: {
      input: DeleteTenantDatabaseCommandInput;
      output: DeleteTenantDatabaseCommandOutput;
    };
  };
}
