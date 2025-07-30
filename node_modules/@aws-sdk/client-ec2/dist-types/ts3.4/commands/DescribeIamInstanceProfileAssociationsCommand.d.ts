import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeIamInstanceProfileAssociationsRequest,
  DescribeIamInstanceProfileAssociationsResult,
} from "../models/models_4";
export { __MetadataBearer };
export { $Command };
export interface DescribeIamInstanceProfileAssociationsCommandInput
  extends DescribeIamInstanceProfileAssociationsRequest {}
export interface DescribeIamInstanceProfileAssociationsCommandOutput
  extends DescribeIamInstanceProfileAssociationsResult,
    __MetadataBearer {}
declare const DescribeIamInstanceProfileAssociationsCommand_base: {
  new (
    input: DescribeIamInstanceProfileAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIamInstanceProfileAssociationsCommandInput,
    DescribeIamInstanceProfileAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeIamInstanceProfileAssociationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeIamInstanceProfileAssociationsCommandInput,
    DescribeIamInstanceProfileAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeIamInstanceProfileAssociationsCommand extends DescribeIamInstanceProfileAssociationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeIamInstanceProfileAssociationsRequest;
      output: DescribeIamInstanceProfileAssociationsResult;
    };
    sdk: {
      input: DescribeIamInstanceProfileAssociationsCommandInput;
      output: DescribeIamInstanceProfileAssociationsCommandOutput;
    };
  };
}
