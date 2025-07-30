import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateIpamResourceDiscoveryRequest,
  CreateIpamResourceDiscoveryResult,
} from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateIpamResourceDiscoveryCommandInput
  extends CreateIpamResourceDiscoveryRequest {}
export interface CreateIpamResourceDiscoveryCommandOutput
  extends CreateIpamResourceDiscoveryResult,
    __MetadataBearer {}
declare const CreateIpamResourceDiscoveryCommand_base: {
  new (
    input: CreateIpamResourceDiscoveryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIpamResourceDiscoveryCommandInput,
    CreateIpamResourceDiscoveryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreateIpamResourceDiscoveryCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreateIpamResourceDiscoveryCommandInput,
    CreateIpamResourceDiscoveryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateIpamResourceDiscoveryCommand extends CreateIpamResourceDiscoveryCommand_base {
  protected static __types: {
    api: {
      input: CreateIpamResourceDiscoveryRequest;
      output: CreateIpamResourceDiscoveryResult;
    };
    sdk: {
      input: CreateIpamResourceDiscoveryCommandInput;
      output: CreateIpamResourceDiscoveryCommandOutput;
    };
  };
}
