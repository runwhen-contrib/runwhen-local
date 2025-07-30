import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeEventCategoriesMessage,
  EventCategoriesMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeEventCategoriesCommandInput
  extends DescribeEventCategoriesMessage {}
export interface DescribeEventCategoriesCommandOutput
  extends EventCategoriesMessage,
    __MetadataBearer {}
declare const DescribeEventCategoriesCommand_base: {
  new (
    input: DescribeEventCategoriesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEventCategoriesCommandInput,
    DescribeEventCategoriesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeEventCategoriesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEventCategoriesCommandInput,
    DescribeEventCategoriesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeEventCategoriesCommand extends DescribeEventCategoriesCommand_base {
  protected static __types: {
    api: {
      input: DescribeEventCategoriesMessage;
      output: EventCategoriesMessage;
    };
    sdk: {
      input: DescribeEventCategoriesCommandInput;
      output: DescribeEventCategoriesCommandOutput;
    };
  };
}
