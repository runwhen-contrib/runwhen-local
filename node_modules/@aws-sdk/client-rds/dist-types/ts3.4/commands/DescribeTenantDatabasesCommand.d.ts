import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeTenantDatabasesMessage,
  TenantDatabasesMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeTenantDatabasesCommandInput
  extends DescribeTenantDatabasesMessage {}
export interface DescribeTenantDatabasesCommandOutput
  extends TenantDatabasesMessage,
    __MetadataBearer {}
declare const DescribeTenantDatabasesCommand_base: {
  new (
    input: DescribeTenantDatabasesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTenantDatabasesCommandInput,
    DescribeTenantDatabasesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTenantDatabasesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTenantDatabasesCommandInput,
    DescribeTenantDatabasesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTenantDatabasesCommand extends DescribeTenantDatabasesCommand_base {
  protected static __types: {
    api: {
      input: DescribeTenantDatabasesMessage;
      output: TenantDatabasesMessage;
    };
    sdk: {
      input: DescribeTenantDatabasesCommandInput;
      output: DescribeTenantDatabasesCommandOutput;
    };
  };
}
