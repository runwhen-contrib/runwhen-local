import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeDhcpOptionsRequest,
  DescribeDhcpOptionsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeDhcpOptionsCommandInput
  extends DescribeDhcpOptionsRequest {}
export interface DescribeDhcpOptionsCommandOutput
  extends DescribeDhcpOptionsResult,
    __MetadataBearer {}
declare const DescribeDhcpOptionsCommand_base: {
  new (
    input: DescribeDhcpOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDhcpOptionsCommandInput,
    DescribeDhcpOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDhcpOptionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDhcpOptionsCommandInput,
    DescribeDhcpOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDhcpOptionsCommand extends DescribeDhcpOptionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDhcpOptionsRequest;
      output: DescribeDhcpOptionsResult;
    };
    sdk: {
      input: DescribeDhcpOptionsCommandInput;
      output: DescribeDhcpOptionsCommandOutput;
    };
  };
}
