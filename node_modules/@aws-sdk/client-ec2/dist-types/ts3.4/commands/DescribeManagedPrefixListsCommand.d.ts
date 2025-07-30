import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeManagedPrefixListsRequest,
  DescribeManagedPrefixListsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeManagedPrefixListsCommandInput
  extends DescribeManagedPrefixListsRequest {}
export interface DescribeManagedPrefixListsCommandOutput
  extends DescribeManagedPrefixListsResult,
    __MetadataBearer {}
declare const DescribeManagedPrefixListsCommand_base: {
  new (
    input: DescribeManagedPrefixListsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeManagedPrefixListsCommandInput,
    DescribeManagedPrefixListsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeManagedPrefixListsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeManagedPrefixListsCommandInput,
    DescribeManagedPrefixListsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeManagedPrefixListsCommand extends DescribeManagedPrefixListsCommand_base {
  protected static __types: {
    api: {
      input: DescribeManagedPrefixListsRequest;
      output: DescribeManagedPrefixListsResult;
    };
    sdk: {
      input: DescribeManagedPrefixListsCommandInput;
      output: DescribeManagedPrefixListsCommandOutput;
    };
  };
}
