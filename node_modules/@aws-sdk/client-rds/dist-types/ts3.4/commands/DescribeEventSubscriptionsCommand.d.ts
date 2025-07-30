import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeEventSubscriptionsMessage,
  EventSubscriptionsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeEventSubscriptionsCommandInput
  extends DescribeEventSubscriptionsMessage {}
export interface DescribeEventSubscriptionsCommandOutput
  extends EventSubscriptionsMessage,
    __MetadataBearer {}
declare const DescribeEventSubscriptionsCommand_base: {
  new (
    input: DescribeEventSubscriptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEventSubscriptionsCommandInput,
    DescribeEventSubscriptionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeEventSubscriptionsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEventSubscriptionsCommandInput,
    DescribeEventSubscriptionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeEventSubscriptionsCommand extends DescribeEventSubscriptionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeEventSubscriptionsMessage;
      output: EventSubscriptionsMessage;
    };
    sdk: {
      input: DescribeEventSubscriptionsCommandInput;
      output: DescribeEventSubscriptionsCommandOutput;
    };
  };
}
