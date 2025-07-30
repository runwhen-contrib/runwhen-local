import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DBEngineVersionMessage,
  DescribeDBEngineVersionsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBEngineVersionsCommandInput
  extends DescribeDBEngineVersionsMessage {}
export interface DescribeDBEngineVersionsCommandOutput
  extends DBEngineVersionMessage,
    __MetadataBearer {}
declare const DescribeDBEngineVersionsCommand_base: {
  new (
    input: DescribeDBEngineVersionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBEngineVersionsCommandInput,
    DescribeDBEngineVersionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeDBEngineVersionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBEngineVersionsCommandInput,
    DescribeDBEngineVersionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBEngineVersionsCommand extends DescribeDBEngineVersionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBEngineVersionsMessage;
      output: DBEngineVersionMessage;
    };
    sdk: {
      input: DescribeDBEngineVersionsCommandInput;
      output: DescribeDBEngineVersionsCommandOutput;
    };
  };
}
