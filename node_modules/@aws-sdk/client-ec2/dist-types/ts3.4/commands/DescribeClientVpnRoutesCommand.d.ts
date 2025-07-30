import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeClientVpnRoutesRequest,
  DescribeClientVpnRoutesResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeClientVpnRoutesCommandInput
  extends DescribeClientVpnRoutesRequest {}
export interface DescribeClientVpnRoutesCommandOutput
  extends DescribeClientVpnRoutesResult,
    __MetadataBearer {}
declare const DescribeClientVpnRoutesCommand_base: {
  new (
    input: DescribeClientVpnRoutesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClientVpnRoutesCommandInput,
    DescribeClientVpnRoutesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeClientVpnRoutesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeClientVpnRoutesCommandInput,
    DescribeClientVpnRoutesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeClientVpnRoutesCommand extends DescribeClientVpnRoutesCommand_base {
  protected static __types: {
    api: {
      input: DescribeClientVpnRoutesRequest;
      output: DescribeClientVpnRoutesResult;
    };
    sdk: {
      input: DescribeClientVpnRoutesCommandInput;
      output: DescribeClientVpnRoutesCommandOutput;
    };
  };
}
