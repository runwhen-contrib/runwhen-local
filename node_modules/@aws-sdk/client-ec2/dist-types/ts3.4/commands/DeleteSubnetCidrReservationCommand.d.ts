import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DeleteSubnetCidrReservationRequest,
  DeleteSubnetCidrReservationResult,
} from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteSubnetCidrReservationCommandInput
  extends DeleteSubnetCidrReservationRequest {}
export interface DeleteSubnetCidrReservationCommandOutput
  extends DeleteSubnetCidrReservationResult,
    __MetadataBearer {}
declare const DeleteSubnetCidrReservationCommand_base: {
  new (
    input: DeleteSubnetCidrReservationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteSubnetCidrReservationCommandInput,
    DeleteSubnetCidrReservationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteSubnetCidrReservationCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteSubnetCidrReservationCommandInput,
    DeleteSubnetCidrReservationCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteSubnetCidrReservationCommand extends DeleteSubnetCidrReservationCommand_base {
  protected static __types: {
    api: {
      input: DeleteSubnetCidrReservationRequest;
      output: DeleteSubnetCidrReservationResult;
    };
    sdk: {
      input: DeleteSubnetCidrReservationCommandInput;
      output: DeleteSubnetCidrReservationCommandOutput;
    };
  };
}
