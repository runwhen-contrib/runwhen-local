import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  CreateNetworkInterfaceRequest,
  CreateNetworkInterfaceResult,
} from "../models/models_2";
export { __MetadataBearer };
export { $Command };
export interface CreateNetworkInterfaceCommandInput
  extends CreateNetworkInterfaceRequest {}
export interface CreateNetworkInterfaceCommandOutput
  extends CreateNetworkInterfaceResult,
    __MetadataBearer {}
declare const CreateNetworkInterfaceCommand_base: {
  new (
    input: CreateNetworkInterfaceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkInterfaceCommandInput,
    CreateNetworkInterfaceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: CreateNetworkInterfaceCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    CreateNetworkInterfaceCommandInput,
    CreateNetworkInterfaceCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class CreateNetworkInterfaceCommand extends CreateNetworkInterfaceCommand_base {
  protected static __types: {
    api: {
      input: CreateNetworkInterfaceRequest;
      output: CreateNetworkInterfaceResult;
    };
    sdk: {
      input: CreateNetworkInterfaceCommandInput;
      output: CreateNetworkInterfaceCommandOutput;
    };
  };
}
