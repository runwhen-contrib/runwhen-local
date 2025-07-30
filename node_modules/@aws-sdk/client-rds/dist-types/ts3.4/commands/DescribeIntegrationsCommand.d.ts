import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeIntegrationsMessage,
  DescribeIntegrationsResponse,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeIntegrationsCommandInput
  extends DescribeIntegrationsMessage {}
export interface DescribeIntegrationsCommandOutput
  extends DescribeIntegrationsResponse,
    __MetadataBearer {}
declare const DescribeIntegrationsCommand_base: {
  new (
    input: DescribeIntegrationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIntegrationsCommandInput,
    DescribeIntegrationsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeIntegrationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIntegrationsCommandInput,
    DescribeIntegrationsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIntegrationsCommand extends DescribeIntegrationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeIntegrationsMessage;
      output: DescribeIntegrationsResponse;
    };
    sdk: {
      input: DescribeIntegrationsCommandInput;
      output: DescribeIntegrationsCommandOutput;
    };
  };
}
