import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeCarrierGatewaysRequest, DescribeCarrierGatewaysResult } from "../models/models_3";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeCarrierGatewaysCommand}.
 */
export interface DescribeCarrierGatewaysCommandInput extends DescribeCarrierGatewaysRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeCarrierGatewaysCommand}.
 */
export interface DescribeCarrierGatewaysCommandOutput extends DescribeCarrierGatewaysResult, __MetadataBearer {
}
declare const DescribeCarrierGatewaysCommand_base: {
    new (input: DescribeCarrierGatewaysCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeCarrierGatewaysCommandInput, DescribeCarrierGatewaysCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeCarrierGatewaysCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeCarrierGatewaysCommandInput, DescribeCarrierGatewaysCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes one or more of your carrier gateways.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeCarrierGatewaysCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeCarrierGatewaysCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeCarrierGatewaysRequest
 *   CarrierGatewayIds: [ // CarrierGatewayIdSet
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
 *   DryRun: true || false,
 * };
 * const command = new DescribeCarrierGatewaysCommand(input);
 * const response = await client.send(command);
 * // { // DescribeCarrierGatewaysResult
 * //   CarrierGateways: [ // CarrierGatewaySet
 * //     { // CarrierGateway
 * //       CarrierGatewayId: "STRING_VALUE",
 * //       VpcId: "STRING_VALUE",
 * //       State: "pending" || "available" || "deleting" || "deleted",
 * //       OwnerId: "STRING_VALUE",
 * //       Tags: [ // TagList
 * //         { // Tag
 * //           Key: "STRING_VALUE",
 * //           Value: "STRING_VALUE",
 * //         },
 * //       ],
 * //     },
 * //   ],
 * //   NextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param DescribeCarrierGatewaysCommandInput - {@link DescribeCarrierGatewaysCommandInput}
 * @returns {@link DescribeCarrierGatewaysCommandOutput}
 * @see {@link DescribeCarrierGatewaysCommandInput} for command's `input` shape.
 * @see {@link DescribeCarrierGatewaysCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeCarrierGatewaysCommand extends DescribeCarrierGatewaysCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeCarrierGatewaysRequest;
            output: DescribeCarrierGatewaysResult;
        };
        sdk: {
            input: DescribeCarrierGatewaysCommandInput;
            output: DescribeCarrierGatewaysCommandOutput;
        };
    };
}
