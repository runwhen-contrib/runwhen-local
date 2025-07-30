import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { ReleaseHostsRequest, ReleaseHostsResult } from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface ReleaseHostsCommandInput extends ReleaseHostsRequest {}
export interface ReleaseHostsCommandOutput
  extends ReleaseHostsResult,
    __MetadataBearer {}
declare const ReleaseHostsCommand_base: {
  new (
    input: ReleaseHostsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReleaseHostsCommandInput,
    ReleaseHostsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ReleaseHostsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ReleaseHostsCommandInput,
    ReleaseHostsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ReleaseHostsCommand extends ReleaseHostsCommand_base {
  protected static __types: {
    api: {
      input: ReleaseHostsRequest;
      output: ReleaseHostsResult;
    };
    sdk: {
      input: ReleaseHostsCommandInput;
      output: ReleaseHostsCommandOutput;
    };
  };
}
