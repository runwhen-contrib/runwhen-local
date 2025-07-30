import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeSourceRegionsMessage,
  SourceRegionMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeSourceRegionsCommandInput
  extends DescribeSourceRegionsMessage {}
export interface DescribeSourceRegionsCommandOutput
  extends SourceRegionMessage,
    __MetadataBearer {}
declare const DescribeSourceRegionsCommand_base: {
  new (
    input: DescribeSourceRegionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSourceRegionsCommandInput,
    DescribeSourceRegionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeSourceRegionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSourceRegionsCommandInput,
    DescribeSourceRegionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSourceRegionsCommand extends DescribeSourceRegionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeSourceRegionsMessage;
      output: SourceRegionMessage;
    };
    sdk: {
      input: DescribeSourceRegionsCommandInput;
      output: DescribeSourceRegionsCommandOutput;
    };
  };
}
