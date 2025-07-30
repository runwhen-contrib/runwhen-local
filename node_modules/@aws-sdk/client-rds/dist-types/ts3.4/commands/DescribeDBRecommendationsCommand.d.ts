import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBRecommendationsMessage,
  DescribeDBRecommendationsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBRecommendationsCommandInput
  extends DescribeDBRecommendationsMessage {}
export interface DescribeDBRecommendationsCommandOutput
  extends DBRecommendationsMessage,
    __MetadataBearer {}
declare const DescribeDBRecommendationsCommand_base: {
  new (
    input: DescribeDBRecommendationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBRecommendationsCommandInput,
    DescribeDBRecommendationsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBRecommendationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBRecommendationsCommandInput,
    DescribeDBRecommendationsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBRecommendationsCommand extends DescribeDBRecommendationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBRecommendationsMessage;
      output: DBRecommendationsMessage;
    };
    sdk: {
      input: DescribeDBRecommendationsCommandInput;
      output: DescribeDBRecommendationsCommandOutput;
    };
  };
}
