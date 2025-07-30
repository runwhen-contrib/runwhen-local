import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { GetInstanceMetadataDefaultsRequest, GetInstanceMetadataDefaultsResult } from "../models/models_6";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link GetInstanceMetadataDefaultsCommand}.
 */
export interface GetInstanceMetadataDefaultsCommandInput extends GetInstanceMetadataDefaultsRequest {
}
/**
 * @public
 *
 * The output of {@link GetInstanceMetadataDefaultsCommand}.
 */
export interface GetInstanceMetadataDefaultsCommandOutput extends GetInstanceMetadataDefaultsResult, __MetadataBearer {
}
declare const GetInstanceMetadataDefaultsCommand_base: {
    new (input: GetInstanceMetadataDefaultsCommandInput): import("@smithy/smithy-client").CommandImpl<GetInstanceMetadataDefaultsCommandInput, GetInstanceMetadataDefaultsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [GetInstanceMetadataDefaultsCommandInput]): import("@smithy/smithy-client").CommandImpl<GetInstanceMetadataDefaultsCommandInput, GetInstanceMetadataDefaultsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Gets the default instance metadata service (IMDS) settings that are set at the account
 *             level in the specified Amazon Web Services
 Region.</p>
 *          <p>For more information, see <a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-options.html#instance-metadata-options-order-of-precedence">Order of precedence for instance metadata options</a> in the
 *                 <i>Amazon EC2 User Guide</i>.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, GetInstanceMetadataDefaultsCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, GetInstanceMetadataDefaultsCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // GetInstanceMetadataDefaultsRequest
 *   DryRun: true || false,
 * };
 * const command = new GetInstanceMetadataDefaultsCommand(input);
 * const response = await client.send(command);
 * // { // GetInstanceMetadataDefaultsResult
 * //   AccountLevel: { // InstanceMetadataDefaultsResponse
 * //     HttpTokens: "optional" || "required",
 * //     HttpPutResponseHopLimit: Number("int"),
 * //     HttpEndpoint: "disabled" || "enabled",
 * //     InstanceMetadataTags: "disabled" || "enabled",
 * //     ManagedBy: "account" || "declarative-policy",
 * //     ManagedExceptionMessage: "STRING_VALUE",
 * //   },
 * // };
 *
 * ```
 *
 * @param GetInstanceMetadataDefaultsCommandInput - {@link GetInstanceMetadataDefaultsCommandInput}
 * @returns {@link GetInstanceMetadataDefaultsCommandOutput}
 * @see {@link GetInstanceMetadataDefaultsCommandInput} for command's `input` shape.
 * @see {@link GetInstanceMetadataDefaultsCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class GetInstanceMetadataDefaultsCommand extends GetInstanceMetadataDefaultsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: GetInstanceMetadataDefaultsRequest;
            output: GetInstanceMetadataDefaultsResult;
        };
        sdk: {
            input: GetInstanceMetadataDefaultsCommandInput;
            output: GetInstanceMetadataDefaultsCommandOutput;
        };
    };
}
