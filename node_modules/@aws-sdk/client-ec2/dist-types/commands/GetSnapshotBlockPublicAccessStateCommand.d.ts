import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { GetSnapshotBlockPublicAccessStateRequest, GetSnapshotBlockPublicAccessStateResult } from "../models/models_6";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link GetSnapshotBlockPublicAccessStateCommand}.
 */
export interface GetSnapshotBlockPublicAccessStateCommandInput extends GetSnapshotBlockPublicAccessStateRequest {
}
/**
 * @public
 *
 * The output of {@link GetSnapshotBlockPublicAccessStateCommand}.
 */
export interface GetSnapshotBlockPublicAccessStateCommandOutput extends GetSnapshotBlockPublicAccessStateResult, __MetadataBearer {
}
declare const GetSnapshotBlockPublicAccessStateCommand_base: {
    new (input: GetSnapshotBlockPublicAccessStateCommandInput): import("@smithy/smithy-client").CommandImpl<GetSnapshotBlockPublicAccessStateCommandInput, GetSnapshotBlockPublicAccessStateCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [GetSnapshotBlockPublicAccessStateCommandInput]): import("@smithy/smithy-client").CommandImpl<GetSnapshotBlockPublicAccessStateCommandInput, GetSnapshotBlockPublicAccessStateCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Gets the current state of <i>block public access for snapshots</i> setting
 *       for the account and Region.</p>
 *          <p>For more information, see <a href="https://docs.aws.amazon.com/ebs/latest/userguide/block-public-access-snapshots.html">
 *       Block public access for snapshots</a> in the <i>Amazon EBS User Guide</i>.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, GetSnapshotBlockPublicAccessStateCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, GetSnapshotBlockPublicAccessStateCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // GetSnapshotBlockPublicAccessStateRequest
 *   DryRun: true || false,
 * };
 * const command = new GetSnapshotBlockPublicAccessStateCommand(input);
 * const response = await client.send(command);
 * // { // GetSnapshotBlockPublicAccessStateResult
 * //   State: "block-all-sharing" || "block-new-sharing" || "unblocked",
 * //   ManagedBy: "account" || "declarative-policy",
 * // };
 *
 * ```
 *
 * @param GetSnapshotBlockPublicAccessStateCommandInput - {@link GetSnapshotBlockPublicAccessStateCommandInput}
 * @returns {@link GetSnapshotBlockPublicAccessStateCommandOutput}
 * @see {@link GetSnapshotBlockPublicAccessStateCommandInput} for command's `input` shape.
 * @see {@link GetSnapshotBlockPublicAccessStateCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class GetSnapshotBlockPublicAccessStateCommand extends GetSnapshotBlockPublicAccessStateCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: GetSnapshotBlockPublicAccessStateRequest;
            output: GetSnapshotBlockPublicAccessStateResult;
        };
        sdk: {
            input: GetSnapshotBlockPublicAccessStateCommandInput;
            output: GetSnapshotBlockPublicAccessStateCommandOutput;
        };
    };
}
