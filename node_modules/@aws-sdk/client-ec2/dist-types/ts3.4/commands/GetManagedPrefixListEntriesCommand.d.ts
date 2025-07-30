import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetManagedPrefixListEntriesRequest,
  GetManagedPrefixListEntriesResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetManagedPrefixListEntriesCommandInput
  extends GetManagedPrefixListEntriesRequest {}
export interface GetManagedPrefixListEntriesCommandOutput
  extends GetManagedPrefixListEntriesResult,
    __MetadataBearer {}
declare const GetManagedPrefixListEntriesCommand_base: {
  new (
    input: GetManagedPrefixListEntriesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetManagedPrefixListEntriesCommandInput,
    GetManagedPrefixListEntriesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetManagedPrefixListEntriesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetManagedPrefixListEntriesCommandInput,
    GetManagedPrefixListEntriesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetManagedPrefixListEntriesCommand extends GetManagedPrefixListEntriesCommand_base {
  protected static __types: {
    api: {
      input: GetManagedPrefixListEntriesRequest;
      output: GetManagedPrefixListEntriesResult;
    };
    sdk: {
      input: GetManagedPrefixListEntriesCommandInput;
      output: GetManagedPrefixListEntriesCommandOutput;
    };
  };
}
