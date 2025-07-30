import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribePrefixListsRequest,
  DescribePrefixListsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribePrefixListsCommandInput
  extends DescribePrefixListsRequest {}
export interface DescribePrefixListsCommandOutput
  extends DescribePrefixListsResult,
    __MetadataBearer {}
declare const DescribePrefixListsCommand_base: {
  new (
    input: DescribePrefixListsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribePrefixListsCommandInput,
    DescribePrefixListsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribePrefixListsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribePrefixListsCommandInput,
    DescribePrefixListsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribePrefixListsCommand extends DescribePrefixListsCommand_base {
  protected static __types: {
    api: {
      input: DescribePrefixListsRequest;
      output: DescribePrefixListsResult;
    };
    sdk: {
      input: DescribePrefixListsCommandInput;
      output: DescribePrefixListsCommandOutput;
    };
  };
}
