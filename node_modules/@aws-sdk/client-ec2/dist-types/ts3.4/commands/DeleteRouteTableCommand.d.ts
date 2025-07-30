import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteRouteTableRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteRouteTableCommandInput extends DeleteRouteTableRequest {}
export interface DeleteRouteTableCommandOutput extends __MetadataBearer {}
declare const DeleteRouteTableCommand_base: {
  new (
    input: DeleteRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteRouteTableCommandInput,
    DeleteRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteRouteTableCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteRouteTableCommandInput,
    DeleteRouteTableCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteRouteTableCommand extends DeleteRouteTableCommand_base {
  protected static __types: {
    api: {
      input: DeleteRouteTableRequest;
      output: {};
    };
    sdk: {
      input: DeleteRouteTableCommandInput;
      output: DeleteRouteTableCommandOutput;
    };
  };
}
