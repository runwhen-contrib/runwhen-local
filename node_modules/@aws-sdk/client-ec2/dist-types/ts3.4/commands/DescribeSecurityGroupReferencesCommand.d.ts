import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeSecurityGroupReferencesRequest,
  DescribeSecurityGroupReferencesResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeSecurityGroupReferencesCommandInput
  extends DescribeSecurityGroupReferencesRequest {}
export interface DescribeSecurityGroupReferencesCommandOutput
  extends DescribeSecurityGroupReferencesResult,
    __MetadataBearer {}
declare const DescribeSecurityGroupReferencesCommand_base: {
  new (
    input: DescribeSecurityGroupReferencesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSecurityGroupReferencesCommandInput,
    DescribeSecurityGroupReferencesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeSecurityGroupReferencesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeSecurityGroupReferencesCommandInput,
    DescribeSecurityGroupReferencesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeSecurityGroupReferencesCommand extends DescribeSecurityGroupReferencesCommand_base {
  protected static __types: {
    api: {
      input: DescribeSecurityGroupReferencesRequest;
      output: DescribeSecurityGroupReferencesResult;
    };
    sdk: {
      input: DescribeSecurityGroupReferencesCommandInput;
      output: DescribeSecurityGroupReferencesCommandOutput;
    };
  };
}
