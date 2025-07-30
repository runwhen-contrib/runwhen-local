import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateDhcpOptionsRequest,
  CreateDhcpOptionsResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateDhcpOptionsCommandInput
  extends CreateDhcpOptionsRequest {}
export interface CreateDhcpOptionsCommandOutput
  extends CreateDhcpOptionsResult,
    __MetadataBearer {}
declare const CreateDhcpOptionsCommand_base: {
  new (
    input: CreateDhcpOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDhcpOptionsCommandInput,
    CreateDhcpOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateDhcpOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateDhcpOptionsCommandInput,
    CreateDhcpOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateDhcpOptionsCommand extends CreateDhcpOptionsCommand_base {
  protected static __types: {
    api: {
      input: CreateDhcpOptionsRequest;
      output: CreateDhcpOptionsResult;
    };
    sdk: {
      input: CreateDhcpOptionsCommandInput;
      output: CreateDhcpOptionsCommandOutput;
    };
  };
}
