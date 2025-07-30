import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  DescribeTrunkInterfaceAssociationsRequest,
  DescribeTrunkInterfaceAssociationsResult,
} from "../models/models_5";
export { __MetadataBearer };
export { $Command };
export interface DescribeTrunkInterfaceAssociationsCommandInput
  extends DescribeTrunkInterfaceAssociationsRequest {}
export interface DescribeTrunkInterfaceAssociationsCommandOutput
  extends DescribeTrunkInterfaceAssociationsResult,
    __MetadataBearer {}
declare const DescribeTrunkInterfaceAssociationsCommand_base: {
  new (
    input: DescribeTrunkInterfaceAssociationsCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTrunkInterfaceAssociationsCommandInput,
    DescribeTrunkInterfaceAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    ...[input]: [] | [DescribeTrunkInterfaceAssociationsCommandInput]
  ): import("@smithy/smithy-client").CommandImpl<
    DescribeTrunkInterfaceAssociationsCommandInput,
    DescribeTrunkInterfaceAssociationsCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DescribeTrunkInterfaceAssociationsCommand extends DescribeTrunkInterfaceAssociationsCommand_base {
  protected static __types: {
    api: {
      input: DescribeTrunkInterfaceAssociationsRequest;
      output: DescribeTrunkInterfaceAssociationsResult;
    };
    sdk: {
      input: DescribeTrunkInterfaceAssociationsCommandInput;
      output: DescribeTrunkInterfaceAssociationsCommandOutput;
    };
  };
}
