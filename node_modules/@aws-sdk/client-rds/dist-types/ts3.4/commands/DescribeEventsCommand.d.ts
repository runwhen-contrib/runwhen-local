import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DescribeEventsMessage, EventsMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeEventsCommandInput extends DescribeEventsMessage {}
export interface DescribeEventsCommandOutput
  extends EventsMessage,
    __MetadataBearer {}
declare const DescribeEventsCommand_base: {
  new (
    input: DescribeEventsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEventsCommandInput,
    DescribeEventsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeEventsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeEventsCommandInput,
    DescribeEventsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeEventsCommand extends DescribeEventsCommand_base {
  protected static __types: {
    api: {
      input: DescribeEventsMessage;
      output: EventsMessage;
    };
    sdk: {
      input: DescribeEventsCommandInput;
      output: DescribeEventsCommandOutput;
    };
  };
}
