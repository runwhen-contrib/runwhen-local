import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { AssociateDhcpOptionsRequest } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateDhcpOptionsCommandInput
  extends AssociateDhcpOptionsRequest {}
export interface AssociateDhcpOptionsCommandOutput extends __MetadataBearer {}
declare const AssociateDhcpOptionsCommand_base: {
  new (
    input: AssociateDhcpOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateDhcpOptionsCommandInput,
    AssociateDhcpOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateDhcpOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateDhcpOptionsCommandInput,
    AssociateDhcpOptionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateDhcpOptionsCommand extends AssociateDhcpOptionsCommand_base {
  protected static __types: {
    api: {
      input: AssociateDhcpOptionsRequest;
      output: {};
    };
    sdk: {
      input: AssociateDhcpOptionsCommandInput;
      output: AssociateDhcpOptionsCommandOutput;
    };
  };
}
