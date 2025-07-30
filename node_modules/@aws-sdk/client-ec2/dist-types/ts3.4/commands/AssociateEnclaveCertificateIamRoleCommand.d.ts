import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  AssociateEnclaveCertificateIamRoleRequest,
  AssociateEnclaveCertificateIamRoleResult,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface AssociateEnclaveCertificateIamRoleCommandInput
  extends AssociateEnclaveCertificateIamRoleRequest {}
export interface AssociateEnclaveCertificateIamRoleCommandOutput
  extends AssociateEnclaveCertificateIamRoleResult,
    __MetadataBearer {}
declare const AssociateEnclaveCertificateIamRoleCommand_base: {
  new (
    input: AssociateEnclaveCertificateIamRoleCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateEnclaveCertificateIamRoleCommandInput,
    AssociateEnclaveCertificateIamRoleCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: AssociateEnclaveCertificateIamRoleCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    AssociateEnclaveCertificateIamRoleCommandInput,
    AssociateEnclaveCertificateIamRoleCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class AssociateEnclaveCertificateIamRoleCommand extends AssociateEnclaveCertificateIamRoleCommand_base {
  protected static __types: {
    api: {
      input: AssociateEnclaveCertificateIamRoleRequest;
      output: AssociateEnclaveCertificateIamRoleResult;
    };
    sdk: {
      input: AssociateEnclaveCertificateIamRoleCommandInput;
      output: AssociateEnclaveCertificateIamRoleCommandOutput;
    };
  };
}
