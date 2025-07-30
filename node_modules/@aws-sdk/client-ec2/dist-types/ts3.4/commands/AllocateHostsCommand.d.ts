import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { AllocateHostsRequest, AllocateHostsResult } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AllocateHostsCommandInput extends AllocateHostsRequest {}
export interface AllocateHostsCommandOutput
  extends AllocateHostsResult,
    __MetadataBearer {}
declare const AllocateHostsCommand_base: {
  new (
    input: AllocateHostsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AllocateHostsCommandInput,
    AllocateHostsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AllocateHostsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AllocateHostsCommandInput,
    AllocateHostsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AllocateHostsCommand extends AllocateHostsCommand_base {
  protected static __types: {
    api: {
      input: AllocateHostsRequest;
      output: AllocateHostsResult;
    };
    sdk: {
      input: AllocateHostsCommandInput;
      output: AllocateHostsCommandOutput;
    };
  };
}
