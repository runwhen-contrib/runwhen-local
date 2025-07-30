import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  MoveAddressToVpcRequest,
  MoveAddressToVpcResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface MoveAddressToVpcCommandInput extends MoveAddressToVpcRequest {}
export interface MoveAddressToVpcCommandOutput
  extends MoveAddressToVpcResult,
    __MetadataBearer {}
declare const MoveAddressToVpcCommand_base: {
  new (
    input: MoveAddressToVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    MoveAddressToVpcCommandInput,
    MoveAddressToVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: MoveAddressToVpcCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    MoveAddressToVpcCommandInput,
    MoveAddressToVpcCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class MoveAddressToVpcCommand extends MoveAddressToVpcCommand_base {
  protected static __types: {
    api: {
      input: MoveAddressToVpcRequest;
      output: MoveAddressToVpcResult;
    };
    sdk: {
      input: MoveAddressToVpcCommandInput;
      output: MoveAddressToVpcCommandOutput;
    };
  };
}
