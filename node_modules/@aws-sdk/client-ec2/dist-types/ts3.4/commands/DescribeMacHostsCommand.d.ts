import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeMacHostsRequest,
  DescribeMacHostsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeMacHostsCommandInput extends DescribeMacHostsRequest {}
export interface DescribeMacHostsCommandOutput
  extends DescribeMacHostsResult,
    __MetadataBearer {}
declare const DescribeMacHostsCommand_base: {
  new (
    input: DescribeMacHostsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeMacHostsCommandInput,
    DescribeMacHostsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeMacHostsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeMacHostsCommandInput,
    DescribeMacHostsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeMacHostsCommand extends DescribeMacHostsCommand_base {
  protected static __types: {
    api: {
      input: DescribeMacHostsRequest;
      output: DescribeMacHostsResult;
    };
    sdk: {
      input: DescribeMacHostsCommandInput;
      output: DescribeMacHostsCommandOutput;
    };
  };
}
