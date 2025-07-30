import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  RejectVpcEndpointConnectionsRequest,
  RejectVpcEndpointConnectionsResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface RejectVpcEndpointConnectionsCommandInput
  extends RejectVpcEndpointConnectionsRequest {}
export interface RejectVpcEndpointConnectionsCommandOutput
  extends RejectVpcEndpointConnectionsResult,
    __MetadataBearer {}
declare const RejectVpcEndpointConnectionsCommand_base: {
  new (
    input: RejectVpcEndpointConnectionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RejectVpcEndpointConnectionsCommandInput,
    RejectVpcEndpointConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: RejectVpcEndpointConnectionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    RejectVpcEndpointConnectionsCommandInput,
    RejectVpcEndpointConnectionsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class RejectVpcEndpointConnectionsCommand extends RejectVpcEndpointConnectionsCommand_base {
  protected static __types: {
    api: {
      input: RejectVpcEndpointConnectionsRequest;
      output: RejectVpcEndpointConnectionsResult;
    };
    sdk: {
      input: RejectVpcEndpointConnectionsCommandInput;
      output: RejectVpcEndpointConnectionsCommandOutput;
    };
  };
}
