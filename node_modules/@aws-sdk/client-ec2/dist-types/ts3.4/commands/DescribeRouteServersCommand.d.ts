import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeRouteServersRequest,
  DescribeRouteServersResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeRouteServersCommandInput
  extends DescribeRouteServersRequest {}
export interface DescribeRouteServersCommandOutput
  extends DescribeRouteServersResult,
    __MetadataBearer {}
declare const DescribeRouteServersCommand_base: {
  new (
    input: DescribeRouteServersCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeRouteServersCommandInput,
    DescribeRouteServersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeRouteServersCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeRouteServersCommandInput,
    DescribeRouteServersCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeRouteServersCommand extends DescribeRouteServersCommand_base {
  protected static __types: {
    api: {
      input: DescribeRouteServersRequest;
      output: DescribeRouteServersResult;
    };
    sdk: {
      input: DescribeRouteServersCommandInput;
      output: DescribeRouteServersCommandOutput;
    };
  };
}
