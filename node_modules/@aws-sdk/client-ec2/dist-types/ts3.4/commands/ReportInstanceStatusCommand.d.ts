import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ReportInstanceStatusRequest } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReportInstanceStatusCommandInput
  extends ReportInstanceStatusRequest {}
export interface ReportInstanceStatusCommandOutput extends __MetadataBearer {}
declare const ReportInstanceStatusCommand_base: {
  new (
    input: ReportInstanceStatusCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReportInstanceStatusCommandInput,
    ReportInstanceStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ReportInstanceStatusCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReportInstanceStatusCommandInput,
    ReportInstanceStatusCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReportInstanceStatusCommand extends ReportInstanceStatusCommand_base {
  protected static __types: {
    api: {
      input: ReportInstanceStatusRequest;
      output: {};
    };
    sdk: {
      input: ReportInstanceStatusCommandInput;
      output: ReportInstanceStatusCommandOutput;
    };
  };
}
