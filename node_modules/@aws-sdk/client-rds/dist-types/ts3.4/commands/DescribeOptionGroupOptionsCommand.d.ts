import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeOptionGroupOptionsMessage,
  OptionGroupOptionsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeOptionGroupOptionsCommandInput
  extends DescribeOptionGroupOptionsMessage {}
export interface DescribeOptionGroupOptionsCommandOutput
  extends OptionGroupOptionsMessage,
    __MetadataBearer {}
declare const DescribeOptionGroupOptionsCommand_base: {
  new (
    input: DescribeOptionGroupOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeOptionGroupOptionsCommandInput,
    DescribeOptionGroupOptionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeOptionGroupOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeOptionGroupOptionsCommandInput,
    DescribeOptionGroupOptionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeOptionGroupOptionsCommand extends DescribeOptionGroupOptionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeOptionGroupOptionsMessage;
      output: OptionGroupOptionsMessage;
    };
    sdk: {
      input: DescribeOptionGroupOptionsCommandInput;
      output: DescribeOptionGroupOptionsCommandOutput;
    };
  };
}
