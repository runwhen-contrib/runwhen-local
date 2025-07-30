import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeValidDBInstanceModificationsMessage,
  DescribeValidDBInstanceModificationsResult,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeValidDBInstanceModificationsCommandInput
  extends DescribeValidDBInstanceModificationsMessage {}
export interface DescribeValidDBInstanceModificationsCommandOutput
  extends DescribeValidDBInstanceModificationsResult,
    __MetadataBearer {}
declare const DescribeValidDBInstanceModificationsCommand_base: {
  new (
    input: DescribeValidDBInstanceModificationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeValidDBInstanceModificationsCommandInput,
    DescribeValidDBInstanceModificationsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DescribeValidDBInstanceModificationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeValidDBInstanceModificationsCommandInput,
    DescribeValidDBInstanceModificationsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeValidDBInstanceModificationsCommand extends DescribeValidDBInstanceModificationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeValidDBInstanceModificationsMessage;
      output: DescribeValidDBInstanceModificationsResult;
    };
    sdk: {
      input: DescribeValidDBInstanceModificationsCommandInput;
      output: DescribeValidDBInstanceModificationsCommandOutput;
    };
  };
}
