import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { AccountAttributesMessage } from "../models/models_0";
import { DescribeAccountAttributesMessage } from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeAccountAttributesCommandInput
  extends DescribeAccountAttributesMessage {}
export interface DescribeAccountAttributesCommandOutput
  extends AccountAttributesMessage,
    __MetadataBearer {}
declare const DescribeAccountAttributesCommand_base: {
  new (
    input: DescribeAccountAttributesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAccountAttributesCommandInput,
    DescribeAccountAttributesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeAccountAttributesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeAccountAttributesCommandInput,
    DescribeAccountAttributesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeAccountAttributesCommand extends DescribeAccountAttributesCommand_base {
  protected static __types: {
    api: {
      input: {};
      output: AccountAttributesMessage;
    };
    sdk: {
      input: DescribeAccountAttributesCommandInput;
      output: DescribeAccountAttributesCommandOutput;
    };
  };
}
