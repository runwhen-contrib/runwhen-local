import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeReservedDBInstancesMessage,
  ReservedDBInstanceMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeReservedDBInstancesCommandInput
  extends DescribeReservedDBInstancesMessage {}
export interface DescribeReservedDBInstancesCommandOutput
  extends ReservedDBInstanceMessage,
    __MetadataBearer {}
declare const DescribeReservedDBInstancesCommand_base: {
  new (
    input: DescribeReservedDBInstancesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedDBInstancesCommandInput,
    DescribeReservedDBInstancesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeReservedDBInstancesCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedDBInstancesCommandInput,
    DescribeReservedDBInstancesCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeReservedDBInstancesCommand extends DescribeReservedDBInstancesCommand_base {
  protected static __types: {
    api: {
      input: DescribeReservedDBInstancesMessage;
      output: ReservedDBInstanceMessage;
    };
    sdk: {
      input: DescribeReservedDBInstancesCommandInput;
      output: DescribeReservedDBInstancesCommandOutput;
    };
  };
}
