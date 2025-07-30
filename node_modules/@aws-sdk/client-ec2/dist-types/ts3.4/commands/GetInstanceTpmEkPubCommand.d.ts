import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetInstanceTpmEkPubRequest,
  GetInstanceTpmEkPubResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetInstanceTpmEkPubCommandInput
  extends GetInstanceTpmEkPubRequest {}
export interface GetInstanceTpmEkPubCommandOutput
  extends GetInstanceTpmEkPubResult,
    __MetadataBearer {}
declare const GetInstanceTpmEkPubCommand_base: {
  new (
    input: GetInstanceTpmEkPubCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetInstanceTpmEkPubCommandInput,
    GetInstanceTpmEkPubCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetInstanceTpmEkPubCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetInstanceTpmEkPubCommandInput,
    GetInstanceTpmEkPubCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetInstanceTpmEkPubCommand extends GetInstanceTpmEkPubCommand_base {
  protected static __types: {
    api: {
      input: GetInstanceTpmEkPubRequest;
      output: GetInstanceTpmEkPubResult;
    };
    sdk: {
      input: GetInstanceTpmEkPubCommandInput;
      output: GetInstanceTpmEkPubCommandOutput;
    };
  };
}
