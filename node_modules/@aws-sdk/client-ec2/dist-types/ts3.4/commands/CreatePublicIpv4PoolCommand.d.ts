import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreatePublicIpv4PoolRequest,
  CreatePublicIpv4PoolResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreatePublicIpv4PoolCommandInput
  extends CreatePublicIpv4PoolRequest {}
export interface CreatePublicIpv4PoolCommandOutput
  extends CreatePublicIpv4PoolResult,
    __MetadataBearer {}
declare const CreatePublicIpv4PoolCommand_base: {
  new (
    input: CreatePublicIpv4PoolCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreatePublicIpv4PoolCommandInput,
    CreatePublicIpv4PoolCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [CreatePublicIpv4PoolCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    CreatePublicIpv4PoolCommandInput,
    CreatePublicIpv4PoolCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreatePublicIpv4PoolCommand extends CreatePublicIpv4PoolCommand_base {
  protected static __types: {
    api: {
      input: CreatePublicIpv4PoolRequest;
      output: CreatePublicIpv4PoolResult;
    };
    sdk: {
      input: CreatePublicIpv4PoolCommandInput;
      output: CreatePublicIpv4PoolCommandOutput;
    };
  };
}
