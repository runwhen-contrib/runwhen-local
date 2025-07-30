import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { EnableReachabilityAnalyzerOrganizationSharingRequest, EnableReachabilityAnalyzerOrganizationSharingResult } from "../models/models_6";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link EnableReachabilityAnalyzerOrganizationSharingCommand}.
 */
export interface EnableReachabilityAnalyzerOrganizationSharingCommandInput extends EnableReachabilityAnalyzerOrganizationSharingRequest {
}
/**
 * @public
 *
 * The output of {@link EnableReachabilityAnalyzerOrganizationSharingCommand}.
 */
export interface EnableReachabilityAnalyzerOrganizationSharingCommandOutput extends EnableReachabilityAnalyzerOrganizationSharingResult, __MetadataBearer {
}
declare const EnableReachabilityAnalyzerOrganizationSharingCommand_base: {
    new (input: EnableReachabilityAnalyzerOrganizationSharingCommandInput): import("@smithy/smithy-client").CommandImpl<EnableReachabilityAnalyzerOrganizationSharingCommandInput, EnableReachabilityAnalyzerOrganizationSharingCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [EnableReachabilityAnalyzerOrganizationSharingCommandInput]): import("@smithy/smithy-client").CommandImpl<EnableReachabilityAnalyzerOrganizationSharingCommandInput, EnableReachabilityAnalyzerOrganizationSharingCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Establishes a trust relationship between Reachability Analyzer and Organizations.
 *          This operation must be performed by the management account for the organization.</p>
 *          <p>After you establish a trust relationship, a user in the management account or
 *          a delegated administrator account can run a cross-account analysis using resources
 *          from the member accounts.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, EnableReachabilityAnalyzerOrganizationSharingCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, EnableReachabilityAnalyzerOrganizationSharingCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // EnableReachabilityAnalyzerOrganizationSharingRequest
 *   DryRun: true || false,
 * };
 * const command = new EnableReachabilityAnalyzerOrganizationSharingCommand(input);
 * const response = await client.send(command);
 * // { // EnableReachabilityAnalyzerOrganizationSharingResult
 * //   ReturnValue: true || false,
 * // };
 *
 * ```
 *
 * @param EnableReachabilityAnalyzerOrganizationSharingCommandInput - {@link EnableReachabilityAnalyzerOrganizationSharingCommandInput}
 * @returns {@link EnableReachabilityAnalyzerOrganizationSharingCommandOutput}
 * @see {@link EnableReachabilityAnalyzerOrganizationSharingCommandInput} for command's `input` shape.
 * @see {@link EnableReachabilityAnalyzerOrganizationSharingCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class EnableReachabilityAnalyzerOrganizationSharingCommand extends EnableReachabilityAnalyzerOrganizationSharingCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: EnableReachabilityAnalyzerOrganizationSharingRequest;
            output: EnableReachabilityAnalyzerOrganizationSharingResult;
        };
        sdk: {
            input: EnableReachabilityAnalyzerOrganizationSharingCommandInput;
            output: EnableReachabilityAnalyzerOrganizationSharingCommandOutput;
        };
    };
}
