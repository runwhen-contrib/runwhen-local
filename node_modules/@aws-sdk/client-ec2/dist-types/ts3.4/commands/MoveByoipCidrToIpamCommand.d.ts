import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  MoveByoipCidrToIpamRequest,
  MoveByoipCidrToIpamResult,
} from "../models/models_7";
export { __MetadataBearer };
export { $Command };
export interface MoveByoipCidrToIpamCommandInput
  extends MoveByoipCidrToIpamRequest {}
export interface MoveByoipCidrToIpamCommandOutput
  extends MoveByoipCidrToIpamResult,
    __MetadataBearer {}
declare const MoveByoipCidrToIpamCommand_base: {
  new (
    input: MoveByoipCidrToIpamCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    MoveByoipCidrToIpamCommandInput,
    MoveByoipCidrToIpamCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: MoveByoipCidrToIpamCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    MoveByoipCidrToIpamCommandInput,
    MoveByoipCidrToIpamCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class MoveByoipCidrToIpamCommand extends MoveByoipCidrToIpamCommand_base {
  protected static __types: {
    api: {
      input: MoveByoipCidrToIpamRequest;
      output: MoveByoipCidrToIpamResult;
    };
    sdk: {
      input: MoveByoipCidrToIpamCommandInput;
      output: MoveByoipCidrToIpamCommandOutput;
    };
  };
}
