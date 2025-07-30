import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  GetAssociatedEnclaveCertificateIamRolesRequest,
  GetAssociatedEnclaveCertificateIamRolesResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface GetAssociatedEnclaveCertificateIamRolesCommandInput
  extends GetAssociatedEnclaveCertificateIamRolesRequest {}
export interface GetAssociatedEnclaveCertificateIamRolesCommandOutput
  extends GetAssociatedEnclaveCertificateIamRolesResult,
    __MetadataBearer {}
declare const GetAssociatedEnclaveCertificateIamRolesCommand_base: {
  new (
    input: GetAssociatedEnclaveCertificateIamRolesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetAssociatedEnclaveCertificateIamRolesCommandInput,
    GetAssociatedEnclaveCertificateIamRolesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: GetAssociatedEnclaveCertificateIamRolesCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    GetAssociatedEnclaveCertificateIamRolesCommandInput,
    GetAssociatedEnclaveCertificateIamRolesCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class GetAssociatedEnclaveCertificateIamRolesCommand extends GetAssociatedEnclaveCertificateIamRolesCommand_base {
  protected static __types: {
    api: {
      input: GetAssociatedEnclaveCertificateIamRolesRequest;
      output: GetAssociatedEnclaveCertificateIamRolesResult;
    };
    sdk: {
      input: GetAssociatedEnclaveCertificateIamRolesCommandInput;
      output: GetAssociatedEnclaveCertificateIamRolesCommandOutput;
    };
  };
}
