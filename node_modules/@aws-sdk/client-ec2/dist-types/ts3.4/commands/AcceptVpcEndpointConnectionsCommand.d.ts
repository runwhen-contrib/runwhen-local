import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AcceptVpcEndpointConnectionsRequest,
  AcceptVpcEndpointConnectionsResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AcceptVpcEndpointConnectionsCommandInput
  extends AcceptVpcEndpointConnectionsRequest {}
export interface AcceptVpcEndpointConnectionsCommandOutput
  extends AcceptVpcEndpointConnectionsResult,
    __MetadataBearer {}
declare const AcceptVpcEndpointConnectionsCommand_base: {
  new (
    input: AcceptVpcEndpointConnectionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptVpcEndpointConnectionsCommandInput,
    AcceptVpcEndpointConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AcceptVpcEndpointConnectionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AcceptVpcEndpointConnectionsCommandInput,
    AcceptVpcEndpointConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AcceptVpcEndpointConnectionsCommand extends AcceptVpcEndpointConnectionsCommand_base {
  protected static __types: {
    api: {
      input: AcceptVpcEndpointConnectionsRequest;
      output: AcceptVpcEndpointConnectionsResult;
    };
    sdk: {
      input: AcceptVpcEndpointConnectionsCommandInput;
      output: AcceptVpcEndpointConnectionsCommandOutput;
    };
  };
}
