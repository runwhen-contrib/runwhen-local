import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetHostReservationPurchasePreviewRequest,
  GetHostReservationPurchasePreviewResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetHostReservationPurchasePreviewCommandInput
  extends GetHostReservationPurchasePreviewRequest {}
export interface GetHostReservationPurchasePreviewCommandOutput
  extends GetHostReservationPurchasePreviewResult,
    __MetadataBearer {}
declare const GetHostReservationPurchasePreviewCommand_base: {
  new (
    input: GetHostReservationPurchasePreviewCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetHostReservationPurchasePreviewCommandInput,
    GetHostReservationPurchasePreviewCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetHostReservationPurchasePreviewCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetHostReservationPurchasePreviewCommandInput,
    GetHostReservationPurchasePreviewCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetHostReservationPurchasePreviewCommand extends GetHostReservationPurchasePreviewCommand_base {
  protected static __types: {
    api: {
      input: GetHostReservationPurchasePreviewRequest;
      output: GetHostReservationPurchasePreviewResult;
    };
    sdk: {
      input: GetHostReservationPurchasePreviewCommandInput;
      output: GetHostReservationPurchasePreviewCommandOutput;
    };
  };
}
