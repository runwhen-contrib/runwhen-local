import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DisableSnapshotBlockPublicAccessRequest, DisableSnapshotBlockPublicAccessResult } from "../models/models_6";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DisableSnapshotBlockPublicAccessCommand}.
 */
export interface DisableSnapshotBlockPublicAccessCommandInput extends DisableSnapshotBlockPublicAccessRequest {
}
/**
 * @public
 *
 * The output of {@link DisableSnapshotBlockPublicAccessCommand}.
 */
export interface DisableSnapshotBlockPublicAccessCommandOutput extends DisableSnapshotBlockPublicAccessResult, __MetadataBearer {
}
declare const DisableSnapshotBlockPublicAccessCommand_base: {
    new (input: DisableSnapshotBlockPublicAccessCommandInput): import("@smithy/smithy-client").CommandImpl<DisableSnapshotBlockPublicAccessCommandInput, DisableSnapshotBlockPublicAccessCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DisableSnapshotBlockPublicAccessCommandInput]): import("@smithy/smithy-client").CommandImpl<DisableSnapshotBlockPublicAccessCommandInput, DisableSnapshotBlockPublicAccessCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Disables the <i>block public access for snapshots</i> setting at
 *       the account level for the specified Amazon Web Services Region. After you disable block public
 *       access for snapshots in a Region, users can publicly share snapshots in that Region.</p>
 *          <important>
 *             <p>Enabling block public access for snapshots in <i>block-all-sharing</i>
 *         mode does not change the permissions for snapshots that are already publicly shared.
 *         Instead, it prevents these snapshots from be publicly visible and publicly accessible.
 *         Therefore, the attributes for these snapshots still indicate that they are publicly
 *         shared, even though they are not publicly available.</p>
 *             <p>If you disable block public access , these snapshots will become publicly available
 *         again.</p>
 *          </important>
 *          <p>For more information, see <a href="https://docs.aws.amazon.com/ebs/latest/userguide/block-public-access-snapshots.html">
 *         Block public access for snapshots</a> in the <i>Amazon EBS User Guide</i> .</p>
 *          <p></p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DisableSnapshotBlockPublicAccessCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DisableSnapshotBlockPublicAccessCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DisableSnapshotBlockPublicAccessRequest
 *   DryRun: true || false,
 * };
 * const command = new DisableSnapshotBlockPublicAccessCommand(input);
 * const response = await client.send(command);
 * // { // DisableSnapshotBlockPublicAccessResult
 * //   State: "block-all-sharing" || "block-new-sharing" || "unblocked",
 * // };
 *
 * ```
 *
 * @param DisableSnapshotBlockPublicAccessCommandInput - {@link DisableSnapshotBlockPublicAccessCommandInput}
 * @returns {@link DisableSnapshotBlockPublicAccessCommandOutput}
 * @see {@link DisableSnapshotBlockPublicAccessCommandInput} for command's `input` shape.
 * @see {@link DisableSnapshotBlockPublicAccessCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DisableSnapshotBlockPublicAccessCommand extends DisableSnapshotBlockPublicAccessCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DisableSnapshotBlockPublicAccessRequest;
            output: DisableSnapshotBlockPublicAccessResult;
        };
        sdk: {
            input: DisableSnapshotBlockPublicAccessCommandInput;
            output: DisableSnapshotBlockPublicAccessCommandOutput;
        };
    };
}
