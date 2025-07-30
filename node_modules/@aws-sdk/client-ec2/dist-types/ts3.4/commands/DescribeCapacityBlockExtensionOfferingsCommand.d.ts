import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeCapacityBlockExtensionOfferingsRequest,
  DescribeCapacityBlockExtensionOfferingsResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DescribeCapacityBlockExtensionOfferingsCommandInput
  extends DescribeCapacityBlockExtensionOfferingsRequest {}
export interface DescribeCapacityBlockExtensionOfferingsCommandOutput
  extends DescribeCapacityBlockExtensionOfferingsResult,
    __MetadataBearer {}
declare const DescribeCapacityBlockExtensionOfferingsCommand_base: {
  new (
    input: DescribeCapacityBlockExtensionOfferingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityBlockExtensionOfferingsCommandInput,
    DescribeCapacityBlockExtensionOfferingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeCapacityBlockExtensionOfferingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeCapacityBlockExtensionOfferingsCommandInput,
    DescribeCapacityBlockExtensionOfferingsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeCapacityBlockExtensionOfferingsCommand extends DescribeCapacityBlockExtensionOfferingsCommand_base {
  protected static __types: {
    api: {
      input: DescribeCapacityBlockExtensionOfferingsRequest;
      output: DescribeCapacityBlockExtensionOfferingsResult;
    };
    sdk: {
      input: DescribeCapacityBlockExtensionOfferingsCommandInput;
      output: DescribeCapacityBlockExtensionOfferingsCommandOutput;
    };
  };
}
