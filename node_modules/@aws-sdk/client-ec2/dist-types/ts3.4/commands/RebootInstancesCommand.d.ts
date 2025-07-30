import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { RebootInstancesRequest } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RebootInstancesCommandInput extends RebootInstancesRequest {}
export interface RebootInstancesCommandOutput extends __MetadataBearer {}
declare const RebootInstancesCommand_base: {
  new (
    input: RebootInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RebootInstancesCommandInput,
    RebootInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RebootInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RebootInstancesCommandInput,
    RebootInstancesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RebootInstancesCommand extends RebootInstancesCommand_base {
  protected static __types: {
    api: {
      input: RebootInstancesRequest;
      output: {};
    };
    sdk: {
      input: RebootInstancesCommandInput;
      output: RebootInstancesCommandOutput;
    };
  };
}
