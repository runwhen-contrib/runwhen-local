import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeIamInstanceProfileAssociationsRequest, DescribeIamInstanceProfileAssociationsResult } from "../models/models_4";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeIamInstanceProfileAssociationsCommand}.
 */
export interface DescribeIamInstanceProfileAssociationsCommandInput extends DescribeIamInstanceProfileAssociationsRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeIamInstanceProfileAssociationsCommand}.
 */
export interface DescribeIamInstanceProfileAssociationsCommandOutput extends DescribeIamInstanceProfileAssociationsResult, __MetadataBearer {
}
declare const DescribeIamInstanceProfileAssociationsCommand_base: {
    new (input: DescribeIamInstanceProfileAssociationsCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeIamInstanceProfileAssociationsCommandInput, DescribeIamInstanceProfileAssociationsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeIamInstanceProfileAssociationsCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeIamInstanceProfileAssociationsCommandInput, DescribeIamInstanceProfileAssociationsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes your IAM instance profile associations.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeIamInstanceProfileAssociationsCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeIamInstanceProfileAssociationsCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeIamInstanceProfileAssociationsRequest
 *   AssociationIds: [ // AssociationIdList
 *     "STRING_VALUE",
 *   ],
 *   Filters: [ // FilterList
 *     { // Filter
 *       Name: "STRING_VALUE",
 *       Values: [ // ValueStringList
 *         "STRING_VALUE",
 *       ],
 *     },
 *   ],
 *   MaxResults: Number("int"),
 *   NextToken: "STRING_VALUE",
 * };
 * const command = new DescribeIamInstanceProfileAssociationsCommand(input);
 * const response = await client.send(command);
 * // { // DescribeIamInstanceProfileAssociationsResult
 * //   IamInstanceProfileAssociations: [ // IamInstanceProfileAssociationSet
 * //     { // IamInstanceProfileAssociation
 * //       AssociationId: "STRING_VALUE",
 * //       InstanceId: "STRING_VALUE",
 * //       IamInstanceProfile: { // IamInstanceProfile
 * //         Arn: "STRING_VALUE",
 * //         Id: "STRING_VALUE",
 * //       },
 * //       State: "associating" || "associated" || "disassociating" || "disassociated",
 * //       Timestamp: new Date("TIMESTAMP"),
 * //     },
 * //   ],
 * //   NextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param DescribeIamInstanceProfileAssociationsCommandInput - {@link DescribeIamInstanceProfileAssociationsCommandInput}
 * @returns {@link DescribeIamInstanceProfileAssociationsCommandOutput}
 * @see {@link DescribeIamInstanceProfileAssociationsCommandInput} for command's `input` shape.
 * @see {@link DescribeIamInstanceProfileAssociationsCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @example To describe an IAM instance profile association
 * ```javascript
 * // This example describes the specified IAM instance profile association.
 * const input = {
 *   AssociationIds: [
 *     "iip-assoc-0db249b1f25fa24b8"
 *   ]
 * };
 * const command = new DescribeIamInstanceProfileAssociationsCommand(input);
 * const response = await client.send(command);
 * /* response is
 * {
 *   IamInstanceProfileAssociations: [
 *     {
 *       AssociationId: "iip-assoc-0db249b1f25fa24b8",
 *       IamInstanceProfile: {
 *         Arn: "arn:aws:iam::123456789012:instance-profile/admin-role",
 *         Id: "AIPAJVQN4F5WVLGCJDRGM"
 *       },
 *       InstanceId: "i-09eb09efa73ec1dee",
 *       State: "associated"
 *     }
 *   ]
 * }
 * *\/
 * ```
 *
 * @public
 */
export declare class DescribeIamInstanceProfileAssociationsCommand extends DescribeIamInstanceProfileAssociationsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeIamInstanceProfileAssociationsRequest;
            output: DescribeIamInstanceProfileAssociationsResult;
        };
        sdk: {
            input: DescribeIamInstanceProfileAssociationsCommandInput;
            output: DescribeIamInstanceProfileAssociationsCommandOutput;
        };
    };
}
