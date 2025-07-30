import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteIpamResourceDiscoveryRequest,
  DeleteIpamResourceDiscoveryResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteIpamResourceDiscoveryCommandInput
  extends DeleteIpamResourceDiscoveryRequest {}
export interface DeleteIpamResourceDiscoveryCommandOutput
  extends DeleteIpamResourceDiscoveryResult,
    __MetadataBearer {}
declare const DeleteIpamResourceDiscoveryCommand_base: {
  new (
    input: DeleteIpamResourceDiscoveryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIpamResourceDiscoveryCommandInput,
    DeleteIpamResourceDiscoveryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteIpamResourceDiscoveryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIpamResourceDiscoveryCommandInput,
    DeleteIpamResourceDiscoveryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteIpamResourceDiscoveryCommand extends DeleteIpamResourceDiscoveryCommand_base {
  protected static __types: {
    api: {
      input: DeleteIpamResourceDiscoveryRequest;
      output: DeleteIpamResourceDiscoveryResult;
    };
    sdk: {
      input: DeleteIpamResourceDiscoveryCommandInput;
      output: DeleteIpamResourceDiscoveryCommandOutput;
    };
  };
}
