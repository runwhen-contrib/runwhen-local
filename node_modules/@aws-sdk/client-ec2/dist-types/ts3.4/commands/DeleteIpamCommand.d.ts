import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteIpamRequest, DeleteIpamResult } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteIpamCommandInput extends DeleteIpamRequest {}
export interface DeleteIpamCommandOutput
  extends DeleteIpamResult,
    __MetadataBearer {}
declare const DeleteIpamCommand_base: {
  new (
    input: DeleteIpamCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIpamCommandInput,
    DeleteIpamCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteIpamCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteIpamCommandInput,
    DeleteIpamCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteIpamCommand extends DeleteIpamCommand_base {
  protected static __types: {
    api: {
      input: DeleteIpamRequest;
      output: DeleteIpamResult;
    };
    sdk: {
      input: DeleteIpamCommandInput;
      output: DeleteIpamCommandOutput;
    };
  };
}
