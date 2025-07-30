import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  MonitorInstancesRequest,
  MonitorInstancesResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface MonitorInstancesCommandInput extends MonitorInstancesRequest {}
export interface MonitorInstancesCommandOutput
  extends MonitorInstancesResult,
    __MetadataBearer {}
declare const MonitorInstancesCommand_base: {
  new (
    input: MonitorInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    MonitorInstancesCommandInput,
    MonitorInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: MonitorInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    MonitorInstancesCommandInput,
    MonitorInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class MonitorInstancesCommand extends MonitorInstancesCommand_base {
  protected static __types: {
    api: {
      input: MonitorInstancesRequest;
      output: MonitorInstancesResult;
    };
    sdk: {
      input: MonitorInstancesCommandInput;
      output: MonitorInstancesCommandOutput;
    };
  };
}
