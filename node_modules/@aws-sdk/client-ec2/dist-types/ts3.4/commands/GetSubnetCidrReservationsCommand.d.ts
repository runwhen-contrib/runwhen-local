import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetSubnetCidrReservationsRequest,
  GetSubnetCidrReservationsResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetSubnetCidrReservationsCommandInput
  extends GetSubnetCidrReservationsRequest {}
export interface GetSubnetCidrReservationsCommandOutput
  extends GetSubnetCidrReservationsResult,
    __MetadataBearer {}
declare const GetSubnetCidrReservationsCommand_base: {
  new (
    input: GetSubnetCidrReservationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetSubnetCidrReservationsCommandInput,
    GetSubnetCidrReservationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetSubnetCidrReservationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetSubnetCidrReservationsCommandInput,
    GetSubnetCidrReservationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetSubnetCidrReservationsCommand extends GetSubnetCidrReservationsCommand_base {
  protected static __types: {
    api: {
      input: GetSubnetCidrReservationsRequest;
      output: GetSubnetCidrReservationsResult;
    };
    sdk: {
      input: GetSubnetCidrReservationsCommandInput;
      output: GetSubnetCidrReservationsCommandOutput;
    };
  };
}
