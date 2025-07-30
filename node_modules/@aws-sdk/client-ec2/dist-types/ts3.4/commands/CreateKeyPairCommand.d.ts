import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { CreateKeyPairRequest, KeyPair } from "../models/models_1";
export { __MetadataBearer };
export { $Command };
export interface CreateKeyPairCommandInput extends CreateKeyPairRequest {}
export interface CreateKeyPairCommandOutput extends KeyPair, __MetadataBearer {}
declare const CreateKeyPairCommand_base: {
  new (
    input: CreateKeyPairCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateKeyPairCommandInput,
    CreateKeyPairCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateKeyPairCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateKeyPairCommandInput,
    CreateKeyPairCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateKeyPairCommand extends CreateKeyPairCommand_base {
  protected static __types: {
    api: {
      input: CreateKeyPairRequest;
      output: KeyPair;
    };
    sdk: {
      input: CreateKeyPairCommandInput;
      output: CreateKeyPairCommandOutput;
    };
  };
}
