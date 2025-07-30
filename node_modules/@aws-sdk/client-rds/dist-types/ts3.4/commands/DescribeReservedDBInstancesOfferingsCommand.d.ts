import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  DescribeReservedDBInstancesOfferingsMessage,
  ReservedDBInstancesOfferingMessage,
} from "../models/models_1";
import {
  RDSClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../RDSClient";
export { __MetadataBearer };
export { $Command };
export interface DescribeReservedDBInstancesOfferingsCommandInput
  extends DescribeReservedDBInstancesOfferingsMessage {}
export interface DescribeReservedDBInstancesOfferingsCommandOutput
  extends ReservedDBInstancesOfferingMessage,
    __MetadataBearer {}
declare const DescribeReservedDBInstancesOfferingsCommand_base: {
  new (
    input: DescribeReservedDBInstancesOfferingsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedDBInstancesOfferingsCommandInput,
    DescribeReservedDBInstancesOfferingsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeReservedDBInstancesOfferingsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeReservedDBInstancesOfferingsCommandInput,
    DescribeReservedDBInstancesOfferingsCommandOutput,
    RDSClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeReservedDBInstancesOfferingsCommand extends DescribeReservedDBInstancesOfferingsCommand_base {
  protected static __types: {
    api: {
      input: DescribeReservedDBInstancesOfferingsMessage;
      output: ReservedDBInstancesOfferingMessage;
    };
    sdk: {
      input: DescribeReservedDBInstancesOfferingsCommandInput;
      output: DescribeReservedDBInstancesOfferingsCommandOutput;
    };
  };
}
