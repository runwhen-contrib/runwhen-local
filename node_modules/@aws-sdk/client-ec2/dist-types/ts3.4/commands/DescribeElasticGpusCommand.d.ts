import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeElasticGpusRequest,
  DescribeElasticGpusResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeElasticGpusCommandInput
  extends DescribeElasticGpusRequest {}
export interface DescribeElasticGpusCommandOutput
  extends DescribeElasticGpusResult,
    __MetadataBearer {}
declare const DescribeElasticGpusCommand_base: {
  new (
    input: DescribeElasticGpusCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeElasticGpusCommandInput,
    DescribeElasticGpusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeElasticGpusCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeElasticGpusCommandInput,
    DescribeElasticGpusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeElasticGpusCommand extends DescribeElasticGpusCommand_base {
  protected static __types: {
    api: {
      input: DescribeElasticGpusRequest;
      output: DescribeElasticGpusResult;
    };
    sdk: {
      input: DescribeElasticGpusCommandInput;
      output: DescribeElasticGpusCommandOutput;
    };
  };
}
