import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetVpnConnectionDeviceTypesRequest,
  GetVpnConnectionDeviceTypesResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetVpnConnectionDeviceTypesCommandInput
  extends GetVpnConnectionDeviceTypesRequest {}
export interface GetVpnConnectionDeviceTypesCommandOutput
  extends GetVpnConnectionDeviceTypesResult,
    __MetadataBearer {}
declare const GetVpnConnectionDeviceTypesCommand_base: {
  new (
    input: GetVpnConnectionDeviceTypesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetVpnConnectionDeviceTypesCommandInput,
    GetVpnConnectionDeviceTypesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [GetVpnConnectionDeviceTypesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    GetVpnConnectionDeviceTypesCommandInput,
    GetVpnConnectionDeviceTypesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetVpnConnectionDeviceTypesCommand extends GetVpnConnectionDeviceTypesCommand_base {
  protected static __types: {
    api: {
      input: GetVpnConnectionDeviceTypesRequest;
      output: GetVpnConnectionDeviceTypesResult;
    };
    sdk: {
      input: GetVpnConnectionDeviceTypesCommandInput;
      output: GetVpnConnectionDeviceTypesCommandOutput;
    };
  };
}
