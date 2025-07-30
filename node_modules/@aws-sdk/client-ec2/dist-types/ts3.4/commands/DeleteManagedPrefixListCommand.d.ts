import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteManagedPrefixListRequest,
  DeleteManagedPrefixListResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteManagedPrefixListCommandInput
  extends DeleteManagedPrefixListRequest {}
export interface DeleteManagedPrefixListCommandOutput
  extends DeleteManagedPrefixListResult,
    __MetadataBearer {}
declare const DeleteManagedPrefixListCommand_base: {
  new (
    input: DeleteManagedPrefixListCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteManagedPrefixListCommandInput,
    DeleteManagedPrefixListCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteManagedPrefixListCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteManagedPrefixListCommandInput,
    DeleteManagedPrefixListCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteManagedPrefixListCommand extends DeleteManagedPrefixListCommand_base {
  protected static __types: {
    api: {
      input: DeleteManagedPrefixListRequest;
      output: DeleteManagedPrefixListResult;
    };
    sdk: {
      input: DeleteManagedPrefixListCommandInput;
      output: DeleteManagedPrefixListCommandOutput;
    };
  };
}
