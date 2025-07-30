import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import { DeleteRouteRequest } from "../models/models_3";
export { __MetadataBearer };
export { $Command };
export interface DeleteRouteCommandInput extends DeleteRouteRequest {}
export interface DeleteRouteCommandOutput extends __MetadataBearer {}
declare const DeleteRouteCommand_base: {
  new (
    input: DeleteRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteRouteCommandInput,
    DeleteRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: DeleteRouteCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    DeleteRouteCommandInput,
    DeleteRouteCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class DeleteRouteCommand extends DeleteRouteCommand_base {
  protected static __types: {
    api: {
      input: DeleteRouteRequest;
      output: {};
    };
    sdk: {
      input: DeleteRouteCommandInput;
      output: DeleteRouteCommandOutput;
    };
  };
}
