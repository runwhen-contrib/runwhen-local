import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeVolumesModificationsRequest,
  DescribeVolumesModificationsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeVolumesModificationsCommandInput
  extends DescribeVolumesModificationsRequest {}
export interface DescribeVolumesModificationsCommandOutput
  extends DescribeVolumesModificationsResult,
    __MetadataBearer {}
declare const DescribeVolumesModificationsCommand_base: {
  new (
    input: DescribeVolumesModificationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVolumesModificationsCommandInput,
    DescribeVolumesModificationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeVolumesModificationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeVolumesModificationsCommandInput,
    DescribeVolumesModificationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeVolumesModificationsCommand extends DescribeVolumesModificationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeVolumesModificationsRequest;
      output: DescribeVolumesModificationsResult;
    };
    sdk: {
      input: DescribeVolumesModificationsCommandInput;
      output: DescribeVolumesModificationsCommandOutput;
    };
  };
}
