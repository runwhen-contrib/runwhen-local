import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetManagedPrefixListAssociationsRequest,
  GetManagedPrefixListAssociationsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetManagedPrefixListAssociationsCommandInput
  extends GetManagedPrefixListAssociationsRequest {}
export interface GetManagedPrefixListAssociationsCommandOutput
  extends GetManagedPrefixListAssociationsResult,
    __MetadataBearer {}
declare const GetManagedPrefixListAssociationsCommand_base: {
  new (
    input: GetManagedPrefixListAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetManagedPrefixListAssociationsCommandInput,
    GetManagedPrefixListAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetManagedPrefixListAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetManagedPrefixListAssociationsCommandInput,
    GetManagedPrefixListAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetManagedPrefixListAssociationsCommand extends GetManagedPrefixListAssociationsCommand_base {
  protected static __types: {
    api: {
      input: GetManagedPrefixListAssociationsRequest;
      output: GetManagedPrefixListAssociationsResult;
    };
    sdk: {
      input: GetManagedPrefixListAssociationsCommandInput;
      output: GetManagedPrefixListAssociationsCommandOutput;
    };
  };
}
