import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeDBLogFilesMessage,
  DescribeDBLogFilesResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeDBLogFilesCommandInput
  extends DescribeDBLogFilesMessage {}
export interface DescribeDBLogFilesCommandOutput
  extends DescribeDBLogFilesResponse,
    __MetadataBearer {}
declare const DescribeDBLogFilesCommand_base: {
  new (
    input: DescribeDBLogFilesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBLogFilesCommandInput,
    DescribeDBLogFilesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeDBLogFilesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeDBLogFilesCommandInput,
    DescribeDBLogFilesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeDBLogFilesCommand extends DescribeDBLogFilesCommand_base {
  protected static __types: {
    api: {
      input: DescribeDBLogFilesMessage;
      output: DescribeDBLogFilesResponse;
    };
    sdk: {
      input: DescribeDBLogFilesCommandInput;
      output: DescribeDBLogFilesCommandOutput;
    };
  };
}
