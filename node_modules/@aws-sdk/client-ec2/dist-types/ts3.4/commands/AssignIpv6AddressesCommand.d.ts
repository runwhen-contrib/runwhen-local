import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssignIpv6AddressesRequest,
  AssignIpv6AddressesResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssignIpv6AddressesCommandInput
  extends AssignIpv6AddressesRequest {}
export interface AssignIpv6AddressesCommandOutput
  extends AssignIpv6AddressesResult,
    __MetadataBearer {}
declare const AssignIpv6AddressesCommand_base: {
  new (
    input: AssignIpv6AddressesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssignIpv6AddressesCommandInput,
    AssignIpv6AddressesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssignIpv6AddressesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssignIpv6AddressesCommandInput,
    AssignIpv6AddressesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssignIpv6AddressesCommand extends AssignIpv6AddressesCommand_base {
  protected static __types: {
    api: {
      input: AssignIpv6AddressesRequest;
      output: AssignIpv6AddressesResult;
    };
    sdk: {
      input: AssignIpv6AddressesCommandInput;
      output: AssignIpv6AddressesCommandOutput;
    };
  };
}
