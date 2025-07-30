import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetIpamAddressHistoryRequest,
  GetIpamAddressHistoryResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetIpamAddressHistoryCommandInput
  extends GetIpamAddressHistoryRequest {}
export interface GetIpamAddressHistoryCommandOutput
  extends GetIpamAddressHistoryResult,
    __MetadataBearer {}
declare const GetIpamAddressHistoryCommand_base: {
  new (
    input: GetIpamAddressHistoryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamAddressHistoryCommandInput,
    GetIpamAddressHistoryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetIpamAddressHistoryCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetIpamAddressHistoryCommandInput,
    GetIpamAddressHistoryCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetIpamAddressHistoryCommand extends GetIpamAddressHistoryCommand_base {
  protected static __types: {
    api: {
      input: GetIpamAddressHistoryRequest;
      output: GetIpamAddressHistoryResult;
    };
    sdk: {
      input: GetIpamAddressHistoryCommandInput;
      output: GetIpamAddressHistoryCommandOutput;
    };
  };
}
