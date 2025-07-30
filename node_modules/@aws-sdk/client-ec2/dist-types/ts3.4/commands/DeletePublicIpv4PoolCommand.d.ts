import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeletePublicIpv4PoolRequest,
  DeletePublicIpv4PoolResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeletePublicIpv4PoolCommandInput
  extends DeletePublicIpv4PoolRequest {}
export interface DeletePublicIpv4PoolCommandOutput
  extends DeletePublicIpv4PoolResult,
    __MetadataBearer {}
declare const DeletePublicIpv4PoolCommand_base: {
  new (
    input: DeletePublicIpv4PoolCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeletePublicIpv4PoolCommandInput,
    DeletePublicIpv4PoolCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeletePublicIpv4PoolCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeletePublicIpv4PoolCommandInput,
    DeletePublicIpv4PoolCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeletePublicIpv4PoolCommand extends DeletePublicIpv4PoolCommand_base {
  protected static __types: {
    api: {
      input: DeletePublicIpv4PoolRequest;
      output: DeletePublicIpv4PoolResult;
    };
    sdk: {
      input: DeletePublicIpv4PoolCommandInput;
      output: DeletePublicIpv4PoolCommandOutput;
    };
  };
}
