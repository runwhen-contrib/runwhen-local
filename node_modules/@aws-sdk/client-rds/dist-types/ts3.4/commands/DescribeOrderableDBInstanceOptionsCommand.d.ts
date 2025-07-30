import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeOrderableDBInstanceOptionsMessage,
  OrderableDBInstanceOptionsMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeOrderableDBInstanceOptionsCommandInput
  extends DescribeOrderableDBInstanceOptionsMessage {}
export interface DescribeOrderableDBInstanceOptionsCommandOutput
  extends OrderableDBInstanceOptionsMessage,
    __MetadataBearer {}
declare const DescribeOrderableDBInstanceOptionsCommand_base: {
  new (
    input: DescribeOrderableDBInstanceOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeOrderableDBInstanceOptionsCommandInput,
    DescribeOrderableDBInstanceOptionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeOrderableDBInstanceOptionsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeOrderableDBInstanceOptionsCommandInput,
    DescribeOrderableDBInstanceOptionsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeOrderableDBInstanceOptionsCommand extends DescribeOrderableDBInstanceOptionsCommand_base {
  protected static __types: {
    api: {
      input: DescribeOrderableDBInstanceOptionsMessage;
      output: OrderableDBInstanceOptionsMessage;
    };
    sdk: {
      input: DescribeOrderableDBInstanceOptionsCommandInput;
      output: DescribeOrderableDBInstanceOptionsCommandOutput;
    };
  };
}
