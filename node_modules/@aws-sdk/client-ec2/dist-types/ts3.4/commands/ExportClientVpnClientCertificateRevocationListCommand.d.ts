import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  EC2ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../EC2Client";
import {
  ExportClientVpnClientCertificateRevocationListRequest,
  ExportClientVpnClientCertificateRevocationListResult,
} from "../models/models_6";
export { __MetadataBearer };
export { $Command };
export interface ExportClientVpnClientCertificateRevocationListCommandInput
  extends ExportClientVpnClientCertificateRevocationListRequest {}
export interface ExportClientVpnClientCertificateRevocationListCommandOutput
  extends ExportClientVpnClientCertificateRevocationListResult,
    __MetadataBearer {}
declare const ExportClientVpnClientCertificateRevocationListCommand_base: {
  new (
    input: ExportClientVpnClientCertificateRevocationListCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ExportClientVpnClientCertificateRevocationListCommandInput,
    ExportClientVpnClientCertificateRevocationListCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    __0_0: ExportClientVpnClientCertificateRevocationListCommandInput
  ): import("@smithy/smithy-client").CommandImpl<
    ExportClientVpnClientCertificateRevocationListCommandInput,
    ExportClientVpnClientCertificateRevocationListCommandOutput,
    EC2ClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
export declare class ExportClientVpnClientCertificateRevocationListCommand extends ExportClientVpnClientCertificateRevocationListCommand_base {
  protected static __types: {
    api: {
      input: ExportClientVpnClientCertificateRevocationListRequest;
      output: ExportClientVpnClientCertificateRevocationListResult;
    };
    sdk: {
      input: ExportClientVpnClientCertificateRevocationListCommandInput;
      output: ExportClientVpnClientCertificateRevocationListCommandOutput;
    };
  };
}
